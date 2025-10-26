# Fix Telegram Webhook URL
# IMPORTANT: Replace the bot_token below with the correct token from your database

# Get this from Supabase Dashboard → SQL Editor:
# SELECT bot_token FROM telegram_config WHERE id = 2;
$botToken = '8498029918:AAGPbTv2z3HEE82gQxWZpXddwCGRsbf0r0c'  # ✅ CORRECT TOKEN

if ($botToken -eq 'YOUR_BOT_TOKEN_HERE') {
    Write-Host "❌ ERROR: Please replace the bot_token in this script!" -ForegroundColor Red
    Write-Host "`nTo get your bot token:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
    Write-Host "2. Run: SELECT bot_token FROM telegram_config WHERE id = 2;" -ForegroundColor Yellow
    Write-Host "3. Replace YOUR_BOT_TOKEN_HERE with the actual token" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Deleting old webhook ===" -ForegroundColor Yellow
try {
    $deleteResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook?drop_pending_updates=true"
    Write-Host "Delete result: $($deleteResult.description)" -ForegroundColor Green
} catch {
    Write-Host "Error deleting webhook: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n=== Setting webhook to telegram-bot-updates ===" -ForegroundColor Yellow
try {
    $setResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=https://fctvityawavmuethxxix.supabase.co/functions/v1/telegram-bot-updates"
    Write-Host "Set result: $($setResult.description) (ok: $($setResult.ok))" -ForegroundColor Green
} catch {
    Write-Host "Error setting webhook: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "`n=== Verifying webhook ===" -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "Webhook URL: $($info.url)" -ForegroundColor Cyan
    Write-Host "Has custom certificate: $($info.has_custom_certificate)" -ForegroundColor Cyan
    Write-Host "Pending updates: $($info.pending_update_count)" -ForegroundColor Cyan
    Write-Host "Last error date: $($info.last_error_date)" -ForegroundColor Cyan
    Write-Host "Last error message: $($info.last_error_message)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting webhook info: $_" -ForegroundColor Red
}

Write-Host "`n=== Done! ===" -ForegroundColor Green
