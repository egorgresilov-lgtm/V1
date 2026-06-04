$links = Get-Content "c:\Users\egorg\Downloads\glen\фотки\достопримечательности\Ссылки.txt"

foreach ($line in $links) {
    if ($line -match "^(\d+)\.(.+)-(.+)$") {
        $num = $matches[1]
        $name = $matches[2].Trim() -replace '"', '' -replace "'", ''
        $url = $matches[3].Trim()

        # Extract img_url from search URL
        $pattern = 'img_url=([^&]+)'
        if ($url -match $pattern) {
            $imgUrl = [System.Net.WebUtility]::UrlDecode($matches[1]) -replace '"', '' -replace "'", ''
            $ext = '.jpg'
            if (-not $ext) { $ext = ".jpg" }  # Default if no extension

            $filename = $num + ". " + $name + $ext
            $filepath = Join-Path "c:\Users\egorg\Downloads\glen\glen\public\images\attractions" $filename

            try {
                Invoke-WebRequest -Uri $imgUrl -OutFile $filepath
            } catch {
            }
        }
    }
}