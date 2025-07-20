// Script de test pour vérifier la création d'un trajet

async function testCreateRide() {
  const testData = {
    departure: "Paris",
    destination: "Lyon",
    departureDate: "2025-07-25",
    departureHour: "14:30",
    arrivalDate: "2025-07-25",
    arrivalHour: "18:00",
    availableSeats: 3,
    pricePerPerson: 25.5,
    status: "open",
    description: "Trajet direct, non-fumeur",
  };

  try {
    console.log("Envoi des données:", testData);

    const response = await fetch("http://localhost:8000/api/rides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Ajouter le token d'authentification
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Succès:", result);
    } else {
      console.log("❌ Erreur:", result);
    }
  } catch (error) {
    console.error("💥 Erreur réseau:", error);
  }
}

// Exécuter le test
// testCreateRide();
