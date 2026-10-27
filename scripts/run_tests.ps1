# Run all unit, integration, and E2E pipeline tests
Write-Host "Running ACO/ECG Pytest Suite..." -ForegroundColor Cyan
python -m pytest backend/app/tests -v
