FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY FinanCareWebAPI.csproj ./
RUN dotnet restore

# Copy everything and build
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7286

ENTRYPOINT ["dotnet", "FinanCareWebAPI.dll"]
