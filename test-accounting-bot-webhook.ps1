$botToken = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'

Write-Host "=== Testing Accounting Bot Webhook ===" -ForegroundColor Yellow

Write-Host "`n1. Getting webhook info..." -ForegroundColor Cyan
try {
    $info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "   Webhook URL: $($info.url)" -ForegroundColor $(if ($info.url) { 'Green' } else { 'Red' })
    Write-Host "   Pending updates: $($info.pending_update_count)" -ForegroundColor Green
    if ($info.last_error_message) {
        Write-Host "   Last error: $($info.last_error_message)" -ForegroundColor Red
        Write-Host "   Last error date: $($info.last_error_date)" -ForegroundColor Red
    } else {
        Write-Host "   Last error: None" -ForegroundColor Green
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing bot connection..." -ForegroundColor Cyan
try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getMe"
    Write-Host "   Bot name: $($botInfo.result.first_name)" -ForegroundColor Green
    Write-Host "   Bot username: @$($botInfo.result.username)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "`n=== Important Notes ===" -ForegroundColor Yellow
Write-Host "1. Check Edge Function logs in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Make sure 'Public Access' is enabled in Edge Function settings" -ForegroundColor White
Write-Host "3. Verify webhook URL is correct: https://fctvityawavmuethxxix.supabase.co/functions/v1/accounting-telegram-bot" -ForegroundColor White
Write-Host "4. Make sure migration is run in Supabase SQL Editor" -ForegroundColor White
