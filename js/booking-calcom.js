// Pricing logic based on flowchart
const pricingLogic = {
  electric: {
    fixed: { restring: 35, setup: 99 },
    strat: { restring: 35, setup: 99 },
    floyd: { restring: null, setup: 100 },
    bigsby: { restring: null, setup: 150 },
    other: { restring: null, setup: null },
    unknown: { restring: null, setup: null },
  },
  acoustic: {
    6: { restring: 60, setup: null },
    12: { restring: null, setup: null },
    other: { restring: null, setup: null },
  },
  bass: {
    4: { restring: 35, setup: 99 },
    5: { restring: null, setup: 100 },
    other: { restring: null, setup: null },
  },
  ukulele: {
    restring: 40,
    setup: null,
  },
  other: {
    restring: 20,
    setup: null,
  },
};

// Additional service prices
const additionalServices = {
  nut: 80,
  fret: 150,
  electronics: 50,
  structural: 200,
};

// Configuration storage
let calcomConfig = {
  apiKey: "cal_live_9ff03291356099a6a619a1d3b6c13bfc",
  eventTypeId: "4279055"
};

// Cache DOM elements
const elements = {
  instrumentType: document.getElementById("instrumentType"),
  bridgeType: document.getElementById("bridgeType"),
  bridgeTypeContainer: document.getElementById("bridgeTypeContainer"),
  numStrings: document.getElementById("numStrings"),
  numStringsContainer: document.getElementById("numStringsContainer"),
  brandModelContainer: document.getElementById("brandModelContainer"),
  serviceCheckboxes: document.querySelectorAll(
    '.checkbox-group input[type="checkbox"]'
  ),
  estimateDisplay: document.getElementById("estimate"),
  priceBreakdown: document.getElementById("priceBreakdown"),
  deliveryRadios: document.querySelectorAll('input[name="delivery"]'),
  pickupAddress: document.getElementById("pickup-address"),
  additionalDetailsContainer: document.getElementById(
    "additionalDetailsContainer"
  ),
  schedulingContainer: document.getElementById("schedulingContainer"),
  estimateSection: document.getElementById("estimateSection"),
  serviceSection: document.getElementById("serviceSection"),
  instrumentDetailsSection: document.getElementById("instrumentDetailsSection"),
  phoneInput: document.getElementById("phone"),
  postalInput: document.getElementById("postal"),
  bookingForm: document.getElementById("booking-form"),
  setupSection: document.getElementById("setup-section"),
  bookingFormContainer: document.getElementById("booking-form-container"),
  successMessage: document.getElementById("success-message"),
  submitBtn: document.getElementById("submit-btn"),
  loading: document.getElementById("loading"),
  bookingError: document.getElementById("booking-error"),
  bookingErrorText: document.getElementById("booking-error-text"),
};

// Phone number formatting
elements.phoneInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 10) value = value.slice(0, 10);

  if (value.length >= 6) {
    e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(
      6
    )}`;
  } else if (value.length >= 3) {
    e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
  } else if (value.length > 0) {
    e.target.value = `(${value}`;
  }
});

// Postal code formatting (Canadian format)
if (elements.postalInput) {
  elements.postalInput.addEventListener("input", (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 6) value = value.slice(0, 6);

    if (value.length > 3) {
      e.target.value = `${value.slice(0, 3)} ${value.slice(3)}`;
    } else {
      e.target.value = value;
    }
  });
}

// Show/hide sections based on instrument type
elements.instrumentType.addEventListener("change", () => {
  const instrument = elements.instrumentType.value;

  elements.instrumentDetailsSection.style.display = instrument
    ? "block"
    : "none";

  if (!instrument) {
    elements.serviceSection.style.display = "none";
    elements.schedulingContainer.style.display = "none";
    elements.estimateSection.style.display = "none";
  }

  const isElectric = instrument === "electric";
  elements.bridgeTypeContainer.style.display = isElectric ? "block" : "none";
  elements.bridgeType.disabled = !isElectric;
  elements.bridgeType.required = isElectric;
  if (!isElectric) {
    elements.bridgeType.value = "";
  }

  const needsStrings = instrument && instrument !== "other";
  elements.numStringsContainer.style.display = needsStrings ? "block" : "none";
  elements.numStrings.required = needsStrings;
  if (!needsStrings) {
    elements.numStrings.value = "";
  }

  updateStringOptions(instrument);
  elements.brandModelContainer.style.display = instrument ? "block" : "none";
  updateServiceSectionVisibility();
  calculatePrice();
});

function updateStringOptions(instrument) {
  const allOptions = {
    electric: ["6", "7", "8"],
    acoustic: ["6", "12"],
    bass: ["4", "5", "6"],
    ukulele: ["4"],
    other: [],
  };

  const options = allOptions[instrument] || [];

  elements.numStrings.innerHTML = '<option value="">Choose a #</option>';
  options.forEach((num) => {
    const option = document.createElement("option");
    option.value = num;
    option.textContent = `${num} String`;
    elements.numStrings.appendChild(option);
  });
}

function updateServiceSectionVisibility() {
  const instrument = elements.instrumentType.value;
  const bridge = elements.bridgeType.value;
  const strings = elements.numStrings.value;

  let showServices = false;

  if (instrument === "electric") {
    showServices = bridge !== "";
  } else if (instrument === "acoustic" || instrument === "bass") {
    showServices = strings !== "";
  } else if (instrument === "ukulele" || instrument === "other") {
    showServices = true;
  }

  elements.serviceSection.style.display = showServices ? "block" : "none";
  if (!showServices) {
    elements.serviceCheckboxes.forEach((cb) => (cb.checked = false));
    elements.schedulingContainer.style.display = "none";
    elements.estimateSection.style.display = "none";
  }
}

elements.bridgeType.addEventListener("change", () => {
  updateServiceSectionVisibility();
  calculatePrice();
});

elements.numStrings.addEventListener("change", () => {
  updateServiceSectionVisibility();
  calculatePrice();
});

elements.serviceCheckboxes.forEach((cb) => {
  cb.addEventListener("change", () => {
    const anyChecked = Array.from(elements.serviceCheckboxes).some(
      (checkbox) => checkbox.checked
    );

    const otherChecked = document.getElementById("service-other").checked;
    elements.additionalDetailsContainer.style.display = otherChecked
      ? "block"
      : "none";
    document.getElementById("additionalDetails").required = otherChecked;

    elements.schedulingContainer.style.display = anyChecked ? "block" : "none";
    elements.estimateSection.style.display = anyChecked ? "block" : "none";

    calculatePrice();
  });
});

elements.deliveryRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const isPickup = radio.value === "pickup";
    elements.pickupAddress.style.display = isPickup ? "block" : "none";

    const pickupFields =
      elements.pickupAddress.querySelectorAll('input[type="text"]');
    pickupFields.forEach((field) => {
      if (field.id === "unit") return;
      field.required = isPickup;
    });
  });
});

function calculatePrice() {
  const instrument = elements.instrumentType.value;
  const bridge = elements.bridgeType.value;
  const strings = elements.numStrings.value;

  let breakdown = [];
  let total = 0;
  let minimumTotal = 0;
  let hasQuotedService = false;

  const selectedServices = Array.from(elements.serviceCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  if (!instrument || selectedServices.length === 0) {
    elements.priceBreakdown.innerHTML =
      '<div class="price-item"><span>Select services above to see pricing</span><span>—</span></div>';
    elements.estimateDisplay.textContent = "$0.00";
    return;
  }

  if (selectedServices.includes("restring")) {
    let restringPrice = null;

    if (instrument === "electric" && bridge) {
      restringPrice = pricingLogic.electric[bridge]?.restring;
    } else if (instrument === "acoustic" && strings) {
      restringPrice = pricingLogic.acoustic[strings]?.restring;
    } else if (instrument === "bass" && strings) {
      restringPrice = pricingLogic.bass[strings]?.restring;
    } else if (instrument === "ukulele") {
      restringPrice = pricingLogic.ukulele.restring;
    } else if (instrument === "other") {
      restringPrice = pricingLogic.other.restring;
    }

    if (restringPrice !== null) {
      breakdown.push({ name: "Restring", price: restringPrice });
      total += restringPrice;
      minimumTotal += restringPrice;
    } else {
      breakdown.push({ name: "Restring", needsQuote: true });
      hasQuotedService = true;
    }
  }

  if (selectedServices.includes("setup")) {
    let setupPrice = null;

    if (instrument === "electric" && bridge) {
      setupPrice = pricingLogic.electric[bridge]?.setup;
    } else if (instrument === "bass" && strings) {
      setupPrice = pricingLogic.bass[strings]?.setup;
    }

    if (setupPrice !== null) {
      breakdown.push({ name: "Complete Setup", price: setupPrice });
      total += setupPrice;
      minimumTotal += setupPrice;
    } else {
      breakdown.push({ name: "Complete Setup", needsQuote: true });
      hasQuotedService = true;
    }
  }

  const serviceNames = {
    nut: "Nut Work",
    fret: "Fret Maintenance",
    electronics: "Electronics Work",
    structural: "Structural Repairs",
  };

  ["nut", "fret", "electronics", "structural"].forEach((service) => {
    if (selectedServices.includes(service)) {
      breakdown.push({
        name: serviceNames[service],
        minimum: additionalServices[service],
        needsQuote: true,
      });
      minimumTotal += additionalServices[service];
      hasQuotedService = true;
    }
  });

  if (selectedServices.includes("other")) {
    breakdown.push({ name: "Other Service", needsQuote: true });
    hasQuotedService = true;
  }

  let breakdownHTML = breakdown
    .map((item) => {
      let priceText;
      if (typeof item.price === "number") {
        priceText = `$${item.price}.00`;
      } else if (item.minimum) {
        priceText = `$${item.minimum}.00+ <span style="color: var(--accent); font-size: 0.9em;">(Quote Required)</span>`;
      } else if (item.needsQuote) {
        priceText = '<span style="color: var(--accent);">Quote Required</span>';
      }
      return `<div class="price-item"><span>${item.name}</span><span>${priceText}</span></div>`;
    })
    .join("");

  if (hasQuotedService) {
    // Don't display $0.00+ when both minimumTotal and total are 0 — show "Quote Required" instead
    const priceLabel =
      minimumTotal === 0 && total === 0
        ? "<strong></strong>"
        : `<strong>$${minimumTotal}.00+</strong>`;

    breakdownHTML += `<div class="price-item" style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px;">
      <span><strong>Minimum Total</strong></span>
      <span>${priceLabel}</span>
    </div>`;
  } else {
    breakdownHTML += `<div class="price-item" style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px;">
      <span><strong>Total</strong></span>
      <span><strong>$${total}.00</strong></span>
    </div>`;
  }

  elements.priceBreakdown.innerHTML = breakdownHTML;

  if (hasQuotedService) {
    if (minimumTotal !== 0) {
      elements.estimateDisplay.innerHTML = `
        <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary);">$${minimumTotal}.00+</div>
        <div style="font-size: 1rem; color: var(--secondary); margin-top: 8px;">Quote Required</div>
      `;
    } else {
      elements.estimateDisplay.innerHTML = `
        <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary);">Quote Required</div>
      `;
    }
  } else {
    elements.estimateDisplay.textContent = `$${total}.00`;
  }
}

// Cal.com API Integration
async function createCalcomBooking(formData) {
  // Build detailed description for Cal.com
  const servicesList = formData.services
    .map((s) => {
      const names = {
        restring: "Restring",
        setup: "Complete Setup",
        nut: "Nut Work",
        fret: "Fret Maintenance",
        electronics: "Electronics Work",
        structural: "Structural Repairs",
        other: "Other Service",
      };
      return names[s] || s;
    })
    .join(", ");

  let instrumentDetails = `${formData.instrument.type}`;
  if (formData.instrument.bridgeType) {
    instrumentDetails += ` - ${formData.instrument.bridgeType} bridge`;
  }
  if (formData.instrument.numStrings) {
    instrumentDetails += ` - ${formData.instrument.numStrings} strings`;
  }
  if (formData.instrument.brandModel) {
    instrumentDetails += ` - ${formData.instrument.brandModel}`;
  }

  let deliveryInfo =
    formData.delivery === "pickup"
      ? `PICKUP & DELIVERY SERVICE REQUESTED\nAddress: ${
          formData.pickupAddress.street
        }${
          formData.pickupAddress.unit ? ", " + formData.pickupAddress.unit : ""
        }, ${formData.pickupAddress.city}, ${formData.pickupAddress.province} ${
          formData.pickupAddress.postal
        }`
      : "Shop drop-off and pickup";

  const description = `
GUITAR SERVICE BOOKING

Customer: ${formData.customer.firstName} ${formData.customer.lastName}
Phone: ${formData.customer.phone}

Instrument: ${instrumentDetails}

Services Requested: ${servicesList}

Service Details:
${formData.additionalDetails}

Preferred Times: ${formData.scheduling}

Delivery: ${deliveryInfo}

Estimated Price: ${formData.estimate}
  `.trim();

  // Cal.com API v2 request
  const bookingData = {
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow as placeholder
    eventTypeId: parseInt(calcomConfig.eventTypeId),
    attendee: {
      name: `${formData.customer.firstName} ${formData.customer.lastName}`,
      email: formData.customer.email,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    meetingUrl: "https://rockshop.example.com", // Your website
    metadata: {
      notes: description,
      phone: formData.customer.phone,
      instrument: formData.instrument.type,
      services: servicesList,
    },
  };

  try {
    const response = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${calcomConfig.apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Form submission
elements.bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loading, hide button
  elements.submitBtn.disabled = true;
  elements.loading.classList.add("show");
  elements.bookingError.classList.remove("show");

  // Collect form data
  const formData = {
    customer: {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: elements.phoneInput.value,
    },
    instrument: {
      type: elements.instrumentType.value,
      bridgeType: elements.bridgeType.value,
      numStrings: elements.numStrings.value,
      brandModel: document.getElementById("brandModel").value,
    },
    services: Array.from(elements.serviceCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value),
    additionalDetails: document.getElementById("additionalDetails").value,
    scheduling: document.getElementById("scheduling").value,
    delivery: document.querySelector('input[name="delivery"]:checked').value,
    estimate: elements.estimateDisplay.textContent,
  };

  if (formData.delivery === "pickup") {
    formData.pickupAddress = {
      street: document.getElementById("street").value,
      unit: document.getElementById("unit").value,
      city: document.getElementById("city").value,
      province: document.getElementById("province").value,
      postal: elements.postalInput.value,
    };
  }

  try {
    // Create Cal.com booking
    const result = await createCalcomBooking(formData);

    console.log("Booking created successfully:", result);

    // Hide form, show success
    elements.bookingForm.style.display = "none";
    elements.successMessage.classList.add("show");

    // Scroll to success message
    elements.successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  } catch (error) {
    console.error("Booking error:", error);

    elements.bookingErrorText.textContent =
      error.message ||
      "Unable to create booking. Please try again or contact us directly.";
    elements.bookingError.classList.add("show");

    // Re-enable submit button
    elements.submitBtn.disabled = false;
  } finally {
    elements.loading.classList.remove("show");
  }
});

// Initialize
// checkConfiguration();
elements.setupSection.style.display = "none";
elements.bookingFormContainer.classList.add("active");
elements.instrumentDetailsSection.style.display = "none";
elements.serviceSection.style.display = "none";
elements.additionalDetailsContainer.style.display = "none";
elements.schedulingContainer.style.display = "none";
elements.estimateSection.style.display = "none";
elements.bookingError.style.display = "none";
calculatePrice();
