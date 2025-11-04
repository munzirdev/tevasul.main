$webhookUrl = 'https://fctvityawavmuethxxix.supabase.co/functions/v1/accounting-telegram-bot'

Write-Host "=== Testing Edge Function ===" -ForegroundColor Yellow

Write-Host "`n1. Testing Edge Function URL..." -ForegroundColor Cyan
try {
    $testBody = @{
        update_id = 1
        message = @{
            message_id = 1
            from = @{
                id = 123456
                is_bot = $false
                first_name = "Test"
            }
            chat = @{
                id = 123456
                type = "private"
            }
            date = [Math]::Floor([decimal]((Get-Date).ToUniversalTime() - (Get-Date "1970-01-01")).TotalSeconds)
            text = "/start"
        }
    } | ConvertTo-Json -Depth 10

    $response = Invoke-WebRequest -Uri $webhookUrl -Method Post -Body $testBody -ContentType 'application/json' -ErrorAction Stop
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Green
    
    if ($response.StatusCode -eq 200) {
        Write-Host "`n✅ Edge Function is accessible!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Edge Function returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "`n❌ Edge Function does not exist!" -ForegroundColor Red
        Write-Host "`nPlease create the Edge Function in Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "1. Go to Supabase Dashboard → Edge Functions" -ForegroundColor White
        Write-Host "2. Click 'Create a new function'" -ForegroundColor White
        Write-Host "3. Name it: accounting-telegram-bot" -ForegroundColor White
        Write-Host "4. Copy code from: supabase/functions/accounting-telegram-bot/index.ts" -ForegroundColor White
        Write-Host "5. Deploy the function" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 401 -or $_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host "`n❌ Edge Function requires authentication!" -ForegroundColor Red
        Write-Host "`nPlease enable 'Public Access' in Edge Function settings:" -ForegroundColor Yellow
        Write-Host "1. Go to Supabase Dashboard → Edge Functions → accounting-telegram-bot" -ForegroundColor White
        Write-Host "2. Open Settings" -ForegroundColor White
        Write-Host "3. Enable 'Public Access' or disable 'Verify JWT'" -ForegroundColor White
        Write-Host "4. Save settings" -ForegroundColor White
    }
}

Write-Host "`n2. Testing Webhook..." -ForegroundColor Cyan
$botToken = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'
try {
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "   Webhook URL: $($webhookInfo.url)" -ForegroundColor $(if ($webhookInfo.url -eq $webhookUrl) { 'Green' } else { 'Yellow' })
    Write-Host "   Expected URL: $webhookUrl" -ForegroundColor Cyan
    Write-Host "   Pending updates: $($webhookInfo.pending_update_count)" -ForegroundColor Green
    
    if ($webhookInfo.last_error_message) {
        Write-Host "   Last error: $($webhookInfo.last_error_message)" -ForegroundColor Red
    }
    
    if ($webhookInfo.url -ne $webhookUrl) {
        Write-Host "`n⚠️ Webhook URL mismatch!" -ForegroundColor Yellow
        Write-Host "`nSetting webhook..." -ForegroundColor Cyan
        $body = @{url=$webhookUrl; allowed_updates=@('message','callback_query')} | ConvertTo-Json
        $setResult = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Body $body -ContentType 'application/json'
        Write-Host "   Result: $($setResult.description)" -ForegroundColor $(if ($setResult.ok) { 'Green' } else { 'Red' })
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

