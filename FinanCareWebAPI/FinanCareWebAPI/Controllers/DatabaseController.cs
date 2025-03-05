using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;

namespace FinanCareWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : Controller
    {
        private readonly string _masterConnectionString = "Server=localhost;Database=master;Trusted_Connection=True;";
        private readonly IConfiguration _configuration;

        public DatabaseController(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateAndImportDatabase(string newDatabaseName, string sourceDatabaseName)
        {
            try
            {
                await CreateDatabase(newDatabaseName);
                await ImportData(newDatabaseName, sourceDatabaseName);
                await CleanSourceDatabase(sourceDatabaseName);
                return Ok($"Database {newDatabaseName} created, data imported, and {sourceDatabaseName} cleaned successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        private async Task CreateDatabase(string databaseName)
        {
            using (var connection = new SqlConnection(_masterConnectionString))
            {
                await connection.OpenAsync();
                string createDbQuery = $"CREATE DATABASE [{databaseName}]";
                using (var command = new SqlCommand(createDbQuery, connection))
                {
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        private async Task ImportData(string targetDatabaseName, string sourceDatabaseName)
        {
            string targetConnectionString = $"Server=localhost;Database={targetDatabaseName};Trusted_Connection=True;";
            string sourceConnectionString = $"Server=localhost;Database={sourceDatabaseName};Trusted_Connection=True;";

            using (var sourceConnection = new SqlConnection(sourceConnectionString))
            using (var targetConnection = new SqlConnection(targetConnectionString))
            {
                await sourceConnection.OpenAsync();
                await targetConnection.OpenAsync();

                // Get tables with dependency order
                var tableNames = await GetTablesInDependencyOrder(sourceConnection, sourceDatabaseName);
                Console.WriteLine($"Tables to process in order: {string.Join(", ", tableNames)}");

                foreach (string tableName in tableNames)
                {
                    Console.WriteLine($"[START] Processing table: {tableName}");

                    // Create table with PK and IDENTITY if present
                    string createTableQuery = await GetTableSchema(sourceConnection, tableName);
                    Console.WriteLine($"Creating table {tableName} in {targetDatabaseName}: {createTableQuery}");
                    using (var createCommand = new SqlCommand(createTableQuery, targetConnection))
                    {
                        await createCommand.ExecuteNonQueryAsync();
                    }

                    // Get column list and check for IDENTITY
                    var (columns, identityColumn) = await GetTableColumns(sourceConnection, tableName, sourceDatabaseName);
                    bool hasIdentity = identityColumn != null;
                    Console.WriteLine($"{tableName} has IDENTITY column ({identityColumn ?? "None"}) in {sourceDatabaseName}: {hasIdentity}");

                    // Build INSERT query with explicit column list
                    string columnList = string.Join(", ", columns.Select(c => $"[{c}]"));
                    string insertQuery = $"INSERT INTO [{targetDatabaseName}].dbo.[{tableName}] ({columnList}) SELECT {columnList} FROM [{sourceDatabaseName}].dbo.[{tableName}]";

                    try
                    {
                        if (hasIdentity)
                        {
                            Console.WriteLine($"Executing IDENTITY_INSERT ON for {tableName} in {targetDatabaseName}");
                            await ExecuteCommand(targetConnection, $"SET IDENTITY_INSERT [{targetDatabaseName}].dbo.[{tableName}] ON");
                            Console.WriteLine($"Executing INSERT for {tableName}: {insertQuery}");
                            await ExecuteCommand(targetConnection, insertQuery);
                            Console.WriteLine($"Executing IDENTITY_INSERT OFF for {tableName} in {targetDatabaseName}");
                            await ExecuteCommand(targetConnection, $"SET IDENTITY_INSERT [{targetDatabaseName}].dbo.[{tableName}] OFF");
                        }
                        else
                        {
                            Console.WriteLine($"Executing INSERT for {tableName} without IDENTITY_INSERT: {insertQuery}");
                            await ExecuteCommand(targetConnection, insertQuery);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error importing data for {tableName}: {ex.Message}");
                        throw new Exception($"Failed to import data for table {tableName}: {ex.Message}", ex);
                    }

                    Console.WriteLine($"[END] Processed table: {tableName}");
                }

                // Add FKs after all tables are created
                foreach (string tableName in tableNames)
                {
                    await AddForeignKeys(targetConnection, tableName, sourceConnection, sourceDatabaseName, targetDatabaseName);
                }
            }
        }

        private async Task<List<string>> GetTablesInDependencyOrder(SqlConnection connection, string databaseName)
        {
            var tables = new List<string>();
            var dependencies = new Dictionary<string, List<string>>();

            // Get all tables
            string getTablesQuery = $"SELECT TABLE_NAME FROM [{databaseName}].INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
            using (var command = new SqlCommand(getTablesQuery, connection))
            {
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        tables.Add(reader["TABLE_NAME"].ToString());
                    }
                }
            }

            // Get FK dependencies
            string fkQuery = $@"
                SELECT 
                    OBJECT_NAME(fk.parent_object_id) AS FKTableName,
                    OBJECT_NAME(fk.referenced_object_id) AS RefTableName
                FROM [{databaseName}].sys.foreign_keys fk";
            using (var command = new SqlCommand(fkQuery, connection))
            {
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        string fkTable = reader["FKTableName"].ToString();
                        string refTable = reader["RefTableName"].ToString();
                        if (!dependencies.ContainsKey(fkTable))
                        {
                            dependencies[fkTable] = new List<string>();
                        }
                        dependencies[fkTable].Add(refTable);
                    }
                }
            }

            // Topological sort
            var orderedTables = new List<string>();
            var visited = new HashSet<string>();
            var tempMark = new HashSet<string>();

            void Visit(string table)
            {
                if (tempMark.Contains(table))
                    throw new Exception($"Circular dependency detected involving {table}");
                if (!visited.Contains(table))
                {
                    tempMark.Add(table);
                    if (dependencies.ContainsKey(table))
                    {
                        foreach (var dep in dependencies[table])
                        {
                            Visit(dep);
                        }
                    }
                    tempMark.Remove(table);
                    visited.Add(table);
                    orderedTables.Add(table);
                }
            }

            foreach (var table in tables)
            {
                if (!visited.Contains(table))
                {
                    Visit(table);
                }
            }

            return orderedTables;
        }

        private async Task ExecuteCommand(SqlConnection connection, string query)
        {
            Console.WriteLine($"Executing query: {query}");
            using (var command = new SqlCommand(query, connection))
            {
                await command.ExecuteNonQueryAsync();
            }
        }

        private async Task<(List<string> Columns, string IdentityColumn)> GetTableColumns(SqlConnection connection, string tableName, string databaseName)
        {
            string columnQuery = $@"
                SELECT c.name, c.is_identity
                FROM [{databaseName}].sys.tables t
                JOIN [{databaseName}].sys.columns c ON t.object_id = c.object_id
                WHERE t.name = @tableName";
            var columns = new List<string>();
            string identityColumn = null;

            using (var command = new SqlCommand(columnQuery, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        string columnName = reader["name"].ToString();
                        bool isIdentity = Convert.ToBoolean(reader["is_identity"]);
                        columns.Add(columnName);
                        if (isIdentity)
                        {
                            identityColumn = columnName;
                        }
                    }
                }
            }

            Console.WriteLine($"Columns for {tableName} in {databaseName}: {string.Join(", ", columns)}");
            return (columns, identityColumn);
        }

        private async Task<string> GetTableSchema(SqlConnection connection, string tableName)
        {
            string schemaQuery = $@"
                SELECT 
                    'CREATE TABLE [' + t.name + '] (' +
                    STRING_AGG(
                        CAST('[' + c.name + '] ' + 
                        tp.name + 
                        CASE 
                            WHEN tp.name IN ('varchar', 'nvarchar', 'char', 'nchar') 
                            THEN '(' + CASE WHEN c.max_length = -1 THEN 'MAX' ELSE CAST(c.max_length / CASE WHEN tp.name IN ('nvarchar', 'nchar') THEN 2 ELSE 1 END AS VARCHAR(10)) END + ')'
                            WHEN tp.name IN ('decimal', 'numeric')
                            THEN '(' + CAST(c.precision AS VARCHAR(10)) + ',' + CAST(c.scale AS VARCHAR(10)) + ')'
                            ELSE ''
                        END +
                        CASE WHEN c.is_identity = 1 THEN ' IDENTITY(1,1)' ELSE '' END +
                        CASE WHEN c.is_nullable = 0 THEN ' NOT NULL' ELSE ' NULL' END AS NVARCHAR(MAX)),
                        ', '
                    ) WITHIN GROUP (ORDER BY c.column_id) + 
                    ISNULL(', CONSTRAINT [PK_' + t.name + '] PRIMARY KEY (' +
                    (SELECT STRING_AGG('[' + col.name + ']', ', ') 
                     FROM sys.indexes i
                     JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                     JOIN sys.columns col ON ic.object_id = col.object_id AND ic.column_id = col.column_id
                     WHERE i.is_primary_key = 1 AND i.object_id = t.object_id) +
                    ')', '') +
                    ')'
                FROM sys.tables t
                JOIN sys.columns c ON t.object_id = c.object_id
                JOIN sys.types tp ON c.system_type_id = tp.system_type_id AND c.user_type_id = tp.user_type_id
                WHERE t.name = @tableName
                GROUP BY t.name, t.object_id";

            using (var command = new SqlCommand(schemaQuery, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                var result = await command.ExecuteScalarAsync();
                return result != null ? result.ToString() : throw new Exception($"Failed to generate schema for table {tableName}");
            }
        }

        private async Task AddForeignKeys(SqlConnection targetConnection, string tableName, SqlConnection sourceConnection, string sourceDatabaseName, string targetDatabaseName)
        {
            string fkQuery = $@"
                SELECT 
                    fk.name AS ForeignKeyName,
                    OBJECT_NAME(fk.parent_object_id) AS FKTableName,
                    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS FKColumnName,
                    OBJECT_NAME(fk.referenced_object_id) AS RefTableName,
                    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS RefColumnName
                FROM [{sourceDatabaseName}].sys.foreign_keys fk
                JOIN [{sourceDatabaseName}].sys.foreign_key_columns fc 
                    ON fk.object_id = fc.constraint_object_id
                WHERE OBJECT_NAME(fk.parent_object_id) = @tableName";

            using (var command = new SqlCommand(fkQuery, sourceConnection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        string fkName = reader["ForeignKeyName"].ToString();
                        string fkTableName = reader["FKTableName"].ToString();
                        string fkColumnName = reader["FKColumnName"].ToString();
                        string refTableName = reader["RefTableName"].ToString();
                        string refColumnName = reader["RefColumnName"].ToString();

                        string addFkQuery = $@"
                            ALTER TABLE [{targetDatabaseName}].dbo.[{fkTableName}]
                            ADD CONSTRAINT [{fkName}] FOREIGN KEY ([{fkColumnName}])
                            REFERENCES [{targetDatabaseName}].dbo.[{refTableName}] ([{refColumnName}])";
                        Console.WriteLine($"Adding FK for {tableName}: {addFkQuery}");
                        try
                        {
                            using (var fkCommand = new SqlCommand(addFkQuery, targetConnection))
                            {
                                await fkCommand.ExecuteNonQueryAsync();
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error adding FK {fkName} for {tableName}: {ex.Message}");
                            throw;
                        }
                    }
                }
            }
        }

        private async Task CleanSourceDatabase(string sourceDatabaseName)
        {
            string sourceConnectionString = $"Server=localhost;Database={sourceDatabaseName};Trusted_Connection=True;";
            var rules = _configuration.GetSection("TableCleanupRules").Get<TableCleanupRule>();

            using (var connection = new SqlConnection(sourceConnectionString))
            {
                await connection.OpenAsync();

                var tableNames = new List<string>();
                string getTablesQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
                using (var command = new SqlCommand(getTablesQuery, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            tableNames.Add(reader["TABLE_NAME"].ToString());
                        }
                    }
                }

                var keepAllTables = new HashSet<string>(rules.KeepAllTables, StringComparer.OrdinalIgnoreCase);
                var aspNetTables = new HashSet<string>(rules.AspNetTables, StringComparer.OrdinalIgnoreCase);
                var customCleanupRules = rules.CustomCleanupRules;

                foreach (string tableName in tableNames)
                {
                    string deleteQuery;
                    if (keepAllTables.Contains(tableName) || aspNetTables.Contains(tableName))
                    {
                        continue;
                    }
                    else if (customCleanupRules.ContainsKey(tableName))
                    {
                        string whereClause = customCleanupRules[tableName].Replace("[SOURCE_DB]", $"[{sourceDatabaseName}]");
                        deleteQuery = $"DELETE FROM [{sourceDatabaseName}].dbo.[{tableName}] WHERE {whereClause}";
                    }
                    else
                    {
                        deleteQuery = $"DELETE FROM [{sourceDatabaseName}].dbo.[{tableName}]";
                    }

                    using (var deleteCommand = new SqlCommand(deleteQuery, connection))
                    {
                        await deleteCommand.ExecuteNonQueryAsync();
                    }
                }
            }
        }
    }

    public class TableCleanupRule
    {
        public List<string> KeepAllTables { get; set; } = new List<string>();
        public List<string> AspNetTables { get; set; } = new List<string>();
        public Dictionary<string, string> CustomCleanupRules { get; set; } = new Dictionary<string, string>();
    }
}