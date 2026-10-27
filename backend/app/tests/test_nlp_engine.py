import pytest
from backend.app.engines.nlp_engine import parse_nlp_command

def test_nlp_parsing_canonical_intents():
    # 1. Type Mutation
    r1 = parse_nlp_command("Change amount from number to string.")
    assert r1["intent"] == "CHANGE_TYPE"
    assert r1["entities"]["field"] == "amount"
    assert r1["entities"]["new_type"] == "string"
    assert r1["requires_confirmation"] is True
    
    # 2. Add Optional Field
    r2 = parse_nlp_command("Add an optional customer phone number.")
    assert r2["intent"] == "ADD_FIELD"
    assert r2["entities"]["field"] == "phone"
    assert r2["entities"]["optional"] is True
    
    # 3. Timeout Change
    r3 = parse_nlp_command("Change the payment timeout from 2 seconds to 5 seconds.")
    assert r3["intent"] == "CHANGE_TIMEOUT"
    assert r3["entities"]["new_value_ms"] == 5000
    
    # 4. Rollback
    r4 = parse_nlp_command("Rollback the last change.")
    assert r4["intent"] == "ROLLBACK"
    assert r4["requires_confirmation"] is True
