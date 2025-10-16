$body = @{
    type     = "textToUI"
    platform = "web"
    style    = "modern"
    prompt   = "Create a landing page for a tech startup with hero section, features, and contact form"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/generate-ui" -Method POST -Body $body -ContentType "application/json"
    Write-Host "API Response Success: $($response.success)"
    Write-Host "Demo Mode: $($response.isDemoMode)"
    if ($response.data) {
        Write-Host "Generated Image Length: $($response.data.image.Length)"
        Write-Host "Generated Code Length: $($response.data.code.Length)"
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}