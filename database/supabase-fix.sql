CREATE OR REPLACE FUNCTION calculate_priority_score(
    p_customer_id UUID,
    p_service_price DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
    customer_rating DECIMAL;
    customer_visits INTEGER;
    customer_cancellation_rate DECIMAL;
    priority_score DECIMAL;
BEGIN
    SELECT c.rating INTO customer_rating
    FROM customers c WHERE c.id = p_customer_id;
    
    SELECT c.total_visits INTO customer_visits
    FROM customers c WHERE c.id = p_customer_id;
    
    SELECT c.cancellation_rate INTO customer_cancellation_rate
    FROM customers c WHERE c.id = p_customer_id;
    
    priority_score := 
        (COALESCE(customer_rating, 0) * 20) +
        (LEAST(customer_visits, 10) * 2) +
        (COALESCE(p_service_price, 0) * 0.5) +
        (CASE WHEN customer_cancellation_rate < 0.1 THEN 10 ELSE 0 END);
    
    RETURN LEAST(priority_score, 100);
END;
$$ LANGUAGE plpgsql;