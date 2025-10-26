$botToken = '8498029918:AAGPbTv2z3HEE82gQxWZpXddwCGRsbf0r0c'

Write-Host "=== Force deleting webhook ===" -ForegroundColor Yellow
try {
    $delete = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/deleteWebhook" -Body @{drop_pending_updates='true'} -ContentType 'application/json'
    Write-Host "Delete result: $($delete.description)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n=== Force setting webhook ===" -ForegroundColor Yellow
try {
    $set = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Body @{url='https://fctvityawavmuethxxix.supabase.co/functions/v1/telegram-bot-updates'} -ContentType 'application/json'
    Write-Host "Set result: $($set.description)" -ForegroundColor Green
    Write-Host "OK: $($set.ok)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n=== Verifying ===" -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "Webhook URL: $($info.url)" -ForegroundColor Cyan
    Write-Host "Pending: $($info.pending_update_count)" -ForegroundColor Cyan
    Write-Host "Last error: $($info.last_error_message)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
