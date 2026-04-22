const lookupVehicleByRego = async (regoInput: string) => {
    const cleanRego = normaliseRego(regoInput);

    setFormData((prev) => ({
        ...prev,
        reg_number: cleanRego,
    }));

    if (!cleanRego || !companyId) {
        setVehicleId(null);
        setFormData((prev) => ({
            ...prev,
            vehicle: "",
            customer: "",
        }));
        setRegoLookupMessage("");
        setRegoLookupError(false);
        return;
    }

    setIsLookingUpRego(true);
    setRegoLookupMessage("");
    setRegoLookupError(false);

    try {
        // STEP 1: try vehicles table only
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("*")
            .eq("company_id", companyId)
            .ilike("rego", cleanRego)
            .maybeSingle();

        if (vehicleError) {
            console.error("Vehicle lookup error:", vehicleError);
            throw vehicleError;
        }

        if (!vehicle) {
            setVehicleId(null);
            setFormData((prev) => ({
                ...prev,
                vehicle: "",
                customer: "",
            }));
            setRegoLookupMessage("No vehicle found for this rego in your database.");
            setRegoLookupError(true);
            return;
        }

        // build vehicle label safely
        const vehicleLabel = [
            vehicle.year,
            vehicle.make,
            vehicle.model,
            vehicle.vin ? `VIN: ${vehicle.vin}` : null,
        ]
            .filter(Boolean)
            .join(" ");

        let customerName = "";

        // STEP 2: fetch customer separately if customer_id exists
        if (vehicle.customer_id) {
            const { data: customer, error: customerError } = await supabase
                .from("customers")
                .select("*")
                .eq("id", vehicle.customer_id)
                .maybeSingle();

            if (customerError) {
                console.error("Customer lookup error:", customerError);
            }

            if (customer) {
                customerName =
                    customer.name ||
                    customer.full_name ||
                    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
                    customer.company_name ||
                    "";
            }
        }

        setVehicleId(vehicle.id);
        setFormData((prev) => ({
            ...prev,
            vehicle: vehicleLabel,
            customer: customerName,
            odometer: prev.odometer || (vehicle.odometer ? String(vehicle.odometer) : ""),
        }));

        setRegoLookupMessage("Vehicle found successfully.");
        setRegoLookupError(false);
    } catch (error) {
        console.error("Rego lookup failed:", error);
        setVehicleId(null);
        setFormData((prev) => ({
            ...prev,
            vehicle: "",
            customer: "",
        }));
        setRegoLookupMessage("Could not fetch vehicle details. Please try again.");
        setRegoLookupError(true);
    } finally {
        setIsLookingUpRego(false);
    }
};