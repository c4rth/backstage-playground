$headers = @{
    "Authorization" = "Bearer my-access-token"
    "Content-Type"  = "application/json"
}

$baseUrl = "https://github.com/c4rth/playground-openapi/blob/main/"
$suffix = "/catalog-info.yaml"

$entries = @(
    # API
    @{ kind = "API"; target = "api/api-product/1.0.0" },
    @{ kind = "API"; target = "api/api-product/1.0.1" },
    @{ kind = "API"; target = "api/api-product/1.0.2" },
    @{ kind = "API"; target = "api/api-product/1.0.3" },
    @{ kind = "API"; target = "api/api-product/1.0.4" },
    @{ kind = "API"; target = "api/api-product/1.0.5" },
    @{ kind = "API"; target = "api/api-product/1.0.6" },
    @{ kind = "API"; target = "api/api-product/1.0.7" },
    @{ kind = "API"; target = "api/api-product/1.0.8" },
    @{ kind = "API"; target = "api/api-product/1.0.9" },
    @{ kind = "API"; target = "api/api-product/1.0.10" },
    @{ kind = "API"; target = "api/api-product/1.1.0" },
    @{ kind = "API"; target = "api/backstage/1.0.0" },
    @{ kind = "API"; target = "api/ecommerce/0.0.1" },
    @{ kind = "API"; target = "api/ecommerce/1.0.0" },
    @{ kind = "API"; target = "api/ecommerce/1.0.1" },
    @{ kind = "API"; target = "api/ecommerce/1.0.2" },
    @{ kind = "API"; target = "api/ecommerce/1.0.3" },
    @{ kind = "API"; target = "api/ecommerce/1.0.4" },
    @{ kind = "API"; target = "api/ecommerce/1.0.5" },
    @{ kind = "API"; target = "api/petstore/1.0.19" },
    @{ kind = "API"; target = "api/petstore/1.0.20" },
    # System
    @{ kind = "System"; target = "system/system-a" },
    @{ kind = "System"; target = "system/system-b" },
    @{ kind = "System"; target = "system/system-c" },
    @{ kind = "System"; target = "system/system-d" };
    # Service
    @{ kind = "Component"; target = "service/istio-system/1/TST" },
    @{ kind = "Component"; target = "service/service-dummy/1/TST" },
    @{ kind = "Component"; target = "service/service-ecommerce/1/TST" },
    @{ kind = "Component"; target = "service/service-ecommerce/1/GTU" },
    @{ kind = "Component"; target = "service/service-ecommerce/1/UAT" },
    @{ kind = "Component"; target = "service/service-ecommerce/2/TST" },
    @{ kind = "Component"; target = "service/service-ecommerce/2/GTU" },
    @{ kind = "Component"; target = "service/service-product/1/TST" },
    @{ kind = "Component"; target = "service/service-product/1/GTU" },
    @{ kind = "Component"; target = "service/service-product/2/TST" },
    @{ kind = "Component"; target = "service/service-product/2/GTU" },
    @{ kind = "Component"; target = "service/service-product/2/UAT" }
)

foreach ($entry in $entries) {
    $body = @{
        kind = $entry.kind
        target = "$($baseUrl)$($entry.target)$($suffix)"
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:7007/api/api-platform/catalog" `
                                      -Method Post `
                                      -Headers $headers `
                                      -Body $body `
                                      -Verbose
        Write-Host "Success for target: $($entry.target)"
    } catch {
        Write-Warning "Failed for target: $($entry.target) - $($_.Exception.Message)"
    }
}