try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "Health check successful: $response"
}
catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
}

try {
    $body = @{
        type     = "textToUI"
        platform = "web"
        style    = "modern"
        prompt   = "Simple login form"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/generate-ui" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success: $($response.success)"
    Write-Host "Image length: $($response.data.image.Length)"
    Write-Host "Code length: $($response.data.code.Length)"
    Write-Host "First 100 chars of code: $($response.data.code.Substring(0, [Math]::Min(100, $response.data.code.Length)))"
}
catch {
    Write-Host "API test failed: $($_.Exception.Message)"
}