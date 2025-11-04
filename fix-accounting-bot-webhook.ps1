$botToken = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'
$webhookUrl = 'https://fctvityawavmuethxxix.supabase.co/functions/v1/accounting-telegram-bot'

Write-Host "=== Fixing Accounting Bot Webhook ===" -ForegroundColor Yellow

Write-Host "`n1. Deleting old webhook..." -ForegroundColor Cyan
try {
    $delete = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/deleteWebhook" -Body @{drop_pending_updates='true'} -ContentType 'application/json'
    Write-Host "   Result: $($delete.description)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n2. Setting new webhook..." -ForegroundColor Cyan
try {
    $body = @{
        url = $webhookUrl
        allowed_updates = @('message', 'callback_query')
    } | ConvertTo-Json
    
    $set = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Body $body -ContentType 'application/json'
    Write-Host "   Result: $($set.description)" -ForegroundColor Green
    Write-Host "   OK: $($set.ok)" -ForegroundColor $(if ($set.ok) { 'Green' } else { 'Red' })
    if (-not $set.ok) {
        Write-Host "   Error code: $($set.error_code)" -ForegroundColor Red
        Write-Host "   Error description: $($set.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n3. Verifying webhook..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "   Webhook URL: $($info.url)" -ForegroundColor $(if ($info.url -eq $webhookUrl) { 'Green' } else { 'Yellow' })
    Write-Host "   Expected URL: $webhookUrl" -ForegroundColor Cyan
    Write-Host "   Pending updates: $($info.pending_update_count)" -ForegroundColor Green
    if ($info.last_error_message) {
        Write-Host "   Last error: $($info.last_error_message)" -ForegroundColor Red
        if ($info.last_error_date) {
            $errorDate = [DateTimeOffset]::FromUnixTimeSeconds($info.last_error_date).DateTime
            Write-Host "   Last error date: $errorDate" -ForegroundColor Red
        }
    } else {
        Write-Host "   Last error: None" -ForegroundColor Green
    }
    
    if ($info.url -ne $webhookUrl) {
        Write-Host "`n⚠️ Webhook URL mismatch! Trying to set again..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $retrySet = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Body $body -ContentType 'application/json'
        Write-Host "   Retry result: $($retrySet.description)" -ForegroundColor $(if ($retrySet.ok) { 'Green' } else { 'Red' })
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard → Edge Functions → accounting-telegram-bot" -ForegroundColor White
Write-Host "2. Open Settings and enable 'Public Access' or disable 'Verify JWT'" -ForegroundColor White
Write-Host "3. Make sure migration is run in Supabase SQL Editor" -ForegroundColor White
Write-Host "4. Test the bot by sending /start to @TevasulFinanceBot" -ForegroundColor White

