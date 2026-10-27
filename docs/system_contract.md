# System Contract: Order Service to Payment Service Interface

## 1. Context & Service Identifiers

- **Consumer Microservice**: `order-service` (Service ID: `svc-order-01`, Port: `8001`)
- **Provider Microservice**: `payment-service` (Service ID: `svc-payment-01`, Port: `8002`)
- **Interaction Channel**: HTTP REST `POST /payment`
- **Contract Version Baseline**: `v1.0.0`
- **Genotype Reference**: `GT-PAYMENT-V1-INIT`

---

## 2. API Contract Specification (OpenAPI 3.1 & JSON Schema)

### Endpoint
```http
POST /payment
Content-Type: application/json
Accept: application/json
```

### Request Payload Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PaymentRequest",
  "type": "object",
  "required": ["user_id", "amount", "currency"],
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the customer initiating payment",
      "example": "U100"
    },
    "amount": {
      "type": "number",
      "description": "Monetary transaction total",
      "minimum": 0.01,
      "example": 100.50
    },
    "currency": {
      "type": "string",
      "enum": ["INR", "USD", "EUR", "GBP"],
      "description": "ISO 4217 standard currency code",
      "example": "INR"
    }
  },
  "additionalProperties": false
}
```

### Response Payload Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PaymentResponse",
  "type": "object",
  "required": ["status", "transaction_id"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["SUCCESS", "PENDING", "FAILED"],
      "example": "SUCCESS"
    },
    "transaction_id": {
      "type": "string",
      "pattern": "^TX[0-9]{3,}$",
      "example": "TX123"
    }
  },
  "additionalProperties": true
}
```

---

## 3. Operational & Temporal Constraints

| Constraint Parameter | Required Threshold | Expressed Gene Name | Family |
|---|---|---|---|
| **Semantic Invariant** | `amount > 0` | `inv_amount_positive` | `INVARIANT_GENE` |
| **Allowed Currencies** | `currency in ['INR', 'USD', 'EUR', 'GBP']` | `inv_currency_valid` | `INVARIANT_GENE` |
| **Max Service Latency** | `latency <= 2000 ms` | `temp_max_latency_2000` | `TEMPORAL_GENE` |
| **Minimum Throughput** | `throughput >= 500 RPS` | `res_min_throughput_500` | `RESOURCE_GENE` |
| **Max Payload Size** | `payload_size <= 64 KB` | `res_max_payload_64k` | `RESOURCE_GENE` |

---

## 4. Contract-As-Genome Gene Mapping

| Gene ID | Family | Name | Path / Selector | Type / Value | Weight ($w_i$) | Immutable |
|---|---|---|---|---|---|---|
| `G-SCH-01` | `SCHEMA_GENE` | `field_user_id` | `request.user_id` | `string, required=true` | `1.0` | `True` |
| `G-SCH-02` | `SCHEMA_GENE` | `field_amount` | `request.amount` | `number, required=true` | `1.0` | `True` |
| `G-SCH-03` | `SCHEMA_GENE` | `field_currency` | `request.currency` | `string, required=true` | `0.9` | `True` |
| `G-SCH-04` | `SCHEMA_GENE` | `field_status` | `response.status` | `string, required=true` | `1.0` | `True` |
| `G-SCH-05` | `SCHEMA_GENE` | `field_tx_id` | `response.transaction_id` | `string, required=true` | `0.8` | `True` |
| `G-INV-01` | `INVARIANT_GENE` | `inv_amount_pos` | `request.amount` | `> 0.0` | `0.95` | `True` |
| `G-INV-02` | `INVARIANT_GENE` | `inv_curr_enum` | `request.currency` | `in ['INR','USD','EUR']` | `0.85` | `True` |
| `G-TMP-01` | `TEMPORAL_GENE` | `temp_latency` | `service.latency` | `<= 2000ms` | `0.80` | `True` |
| `G-RES-01` | `RESOURCE_GENE` | `res_throughput` | `service.throughput`| `>= 500 RPS` | `0.75` | `True` |
| `G-ERR-01` | `ERROR_TAXONOMY_GENE` | `err_code_400`| `response.400` | `BAD_REQUEST` | `0.50` | `True` |

---

## 5. Epigenetic Conditioning Profile Baseline

```json
{
  "service_id": "svc-payment-01",
  "genotype_version": "v1.0.0",
  "epigenome_state": {
    "G-SCH-01": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-SCH-02": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-SCH-03": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-SCH-04": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-SCH-05": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-INV-01": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-INV-02": { "methylation": 0.0, "active": true, "context": "nominal" },
    "G-TMP-01": { "methylation": 0.05, "active": true, "context": "load_nominal" },
    "G-RES-01": { "methylation": 0.02, "active": true, "context": "capacity_nominal" },
    "G-ERR-01": { "methylation": 0.0, "active": true, "context": "nominal" }
  }
}
```
