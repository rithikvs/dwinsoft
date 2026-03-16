#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated Theme Color Migration Script for DWINSOFT Project
.DESCRIPTION
    This script helps migrate all page files to use the new professional blue/black theme
    with proper green/red status colors.
.USAGE
    ./Update-Theme.ps1 -Confirm:$false
#>

param(
    [bool]$DryRun = $false,
    [bool]$Verbose = $true
)

Write-Host "=== DWINSOFT Theme Color Migration ===" -ForegroundColor Cyan
Write-Host "Professional Blue & Black Theme with Green/Red Status Colors" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "d:\sem 6\projects\DWINSOFT\frontend\src\pages"
$files = @(
    "Transactions.jsx",
    "BankAccounts.jsx",
    "HandCash.jsx",
    "Invoices.jsx",
    "EmployeeDashboard.jsx",
    "EmployeeProfile.jsx",
    "MyProfile.jsx",
    "CreateUser.jsx",
    "Settings.jsx",
    "RecycleBin.jsx"
)

$replacements = @(
    # Import statements
    @{
        pattern = 'import { ThemeContext } from.*?from.*?ThemeContext.*?;'
        replacement = 'import { ThemeContext } from ''../context/ThemeContext'';
import { getThemeColors, colorPalette } from ''../utils/colors'';'
        description = 'Add theme utilities import'
    },
    
    # Color definitions
    @{
        pattern = 'const cardBg = isDark \? ''#1e293b'' : ''#fff'';.*?const inputBg = isDark \? ''#0f172a'' : ''#f8fafc'';'
        replacement = 'const colors = getThemeColors(isDark);
    const { cardBg, textColor, mutedColor, borderColor, inputBg } = colors;'
        description = 'Replace color definitions with theme utilities'
    }
)

Write-Host "Files to update:" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

if ($DryRun) {
    Write-Host "Running in DRY RUN mode - no files will be modified" -ForegroundColor Yellow
    Write-Host ""
}

# Notes for manual replacements
Write-Host "=== IMPORTANT COLOR REPLACEMENTS ===" -ForegroundColor Yellow
Write-Host ""

$colorMap = @{
    "#667eea" = "colorPalette.primary.base (Professional Blue)"
    "#764ba2" = "colorPalette.primary.dark (Dark Blue)"
    "#6366f1" = "colorPalette.primary.medium (Medium Blue)"
    "#10b981" = "colorPalette.status.success (Income/Green)"
    "#ef4444" = "colorPalette.status.error (Expense/Red)"
    "#f59e0b" = "colorPalette.status.warning (Pending/Amber)"
    "#fef3c7" = "colorPalette.status.warningLight (Light Amber)"
    "#d1fae5" = "colorPalette.status.successLight (Light Green)"
    "#fee2e2" = "colorPalette.status.errorLight (Light Red)"
}

$colorMap.GetEnumerator() | ForEach-Object {
    Write-Host "Replace: $($_.Key)" -ForegroundColor Cyan
    Write-Host "   With: $($_.Value)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== STATUS ===" -ForegroundColor Yellow

# Check which files already have the import
$files | ForEach-Object {
    $filePath = Join-Path $projectRoot $_
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        if ($content -match 'getThemeColors.*colorPalette') {
            Write-Host "✓ $_ - Already updated" -ForegroundColor Green
        } else {
            Write-Host "⚠ $_ - Needs update" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. For each file marked with ⚠:" -ForegroundColor White
Write-Host "   a. Add this import at the top:" -ForegroundColor Gray
Write-Host "      import { getThemeColors, colorPalette } from '../utils/colors';" -ForegroundColor Cyan
Write-Host ""
Write-Host "   b. Replace color definitions:" -ForegroundColor Gray
Write-Host "      OLD: const cardBg = isDark ? '#1e293b' : '#fff';" -ForegroundColor Red
Write-Host "      NEW: const colors = getThemeColors(isDark);" -ForegroundColor Green
Write-Host "           const { cardBg, textColor, mutedColor, borderColor, inputBg } = colors;" -ForegroundColor Green
Write-Host ""
Write-Host "   c. Use Find & Replace (Ctrl+H) to update colors:" -ForegroundColor Gray
Write-Host "      #667eea → colorPalette.primary.base" -ForegroundColor Cyan
Write-Host "      #ef4444 → colorPalette.status.error" -ForegroundColor Cyan
Write-Host "      #10b981 → colorPalette.status.success" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test in both light and dark modes" -ForegroundColor White
Write-Host "3. Verify colors match the specifications in THEME_MIGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "=== COLOR PALETTE QUICK REFERENCE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Primary Blue Theme:" -ForegroundColor White
Write-Host "  colorPalette.primary.dark...... #1e40af (Deep Blue)" -ForegroundColor Cyan
Write-Host "  colorPalette.primary.base..... #2563eb (Professional Blue) ⭐ Main" -ForegroundColor Green  
Write-Host "  colorPalette.primary.medium... #3b82f6 (Medium Blue)" -ForegroundColor Cyan
Write-Host "  colorPalette.primary.light.... #60a5fa (Light Blue)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Status Colors:" -ForegroundColor White
Write-Host "  colorPalette.status.success... #10b981 (Green) - Income" -ForegroundColor Green
Write-Host "  colorPalette.status.error..... #ef4444 (Red) - Expense" -ForegroundColor Red
Write-Host "  colorPalette.status.warning... #f59e0b (Amber) - Pending" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Theme migration script completed!" -ForegroundColor Green
