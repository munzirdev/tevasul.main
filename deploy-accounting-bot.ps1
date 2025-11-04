# Deploy Accounting Telegram Bot Edge Function
# This script deploys the accounting-telegram-bot function to Supabase

Write-Host "=== Deploying Accounting Telegram Bot Edge Function ===" -ForegroundColor Yellow

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host "`nPlease install it using one of these methods:" -ForegroundColor Yellow
    Write-Host "1. npm install -g supabase" -ForegroundColor White
    Write-Host "2. Or download from: https://github.com/supabase/cli/releases" -ForegroundColor White
    Write-Host "`nOr deploy manually:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase Dashboard → Edge Functions" -ForegroundColor White
    Write-Host "2. Click 'Create a new function'" -ForegroundColor White
    Write-Host "3. Name it: accounting-telegram-bot" -ForegroundColor White
    Write-Host "4. Copy the content from: supabase/functions/accounting-telegram-bot/index.ts" -ForegroundColor White
    Write-Host "5. Paste it in the function editor" -ForegroundColor White
    Write-Host "6. Deploy the function" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Supabase CLI found" -ForegroundColor Green

# Check if user is logged in
Write-Host "`nChecking Supabase login status..." -ForegroundColor Cyan
try {
    $loginCheck = supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Not logged in. Please login first:" -ForegroundColor Yellow
        Write-Host "   supabase login" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "⚠️ Error checking login status" -ForegroundColor Yellow
}

Write-Host "`nDeploying accounting-telegram-bot function..." -ForegroundColor Cyan
try {
    supabase functions deploy accounting-telegram-bot --no-verify-jwt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Function deployed successfully!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. Go to Supabase Dashboard → Edge Functions → accounting-telegram-bot" -ForegroundColor White
        Write-Host "2. Open Settings and enable 'Public Access' or disable 'Verify JWT'" -ForegroundColor White
        Write-Host "3. Run the migration in SQL Editor" -ForegroundColor White
        Write-Host "4. Test the bot by sending /start to @TevasulFinanceBot" -ForegroundColor White
    } else {
        Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
        Write-Host "`nYou can deploy manually:" -ForegroundColor Yellow
        Write-Host "1. Go to Supabase Dashboard → Edge Functions" -ForegroundColor White
        Write-Host "2. Click 'Create a new function'" -ForegroundColor White
        Write-Host "3. Name it: accounting-telegram-bot" -ForegroundColor White
        Write-Host "4. Copy the content from: supabase/functions/accounting-telegram-bot/index.ts" -ForegroundColor White
        Write-Host "5. Paste it in the function editor" -ForegroundColor White
        Write-Host "6. Deploy the function" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ Error deploying function: $_" -ForegroundColor Red
    Write-Host "`nYou can deploy manually:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase Dashboard → Edge Functions" -ForegroundColor White
    Write-Host "2. Click 'Create a new function'" -ForegroundColor White
    Write-Host "3. Name it: accounting-telegram-bot" -ForegroundColor White
    Write-Host "4. Copy the content from: supabase/functions/accounting-telegram-bot/index.ts" -ForegroundColor White
    Write-Host "5. Paste it in the function editor" -ForegroundColor White
    Write-Host "6. Deploy the function" -ForegroundColor White
}

