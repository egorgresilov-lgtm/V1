$files = Get-ChildItem "c:\Users\egorg\Downloads\glen\фотки" -Filter "*.jpg"
foreach ($file in $files) {
    if ($file.Name -match "Улан") {
        Copy-Item $file.FullName -Destination "c:\Users\egorg\Downloads\glen\фотки\достопримечательности\" -Force
        Write-Host "Copied: $($file.Name)"
    }
}
