# Clean up bad imports injected by the first script run (empty path "./")
$srcRoot = 'c:\Rilindi\Programim\GitHubProjekte\FinanCare\financarevite\src'
$count = 0

Get-ChildItem -Path $srcRoot -Recurse -Filter '*.jsx' | ForEach-Object {
  $file = $_.FullName
  $content = Get-Content $file -Raw -Encoding UTF8

  # Remove bad imports with empty or "./" path for darkSelectStyles
  $newContent = $content -replace 'import \{ darkSelectStyles \} from "\./?";\r?\n', ''
  $newContent = $newContent -replace 'import \{ darkSelectStyles \} from "";\r?\n', ''

  if ($newContent -ne $content) {
    Set-Content $file -Value $newContent -Encoding UTF8 -NoNewline
    Write-Host "Cleaned: $($_.Name)"
    $count++
  }
}
Write-Host ""
Write-Host "Done. Cleaned $count files."
