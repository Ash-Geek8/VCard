function processCSV() {
    const fileInput = document.getElementById("csvFile");
    const startingIndexInput = document.getElementById("startingIndex");
    const moderateIdsInput = document.getElementById("moderateIds");
    const mildIdsInput = document.getElementById("mildIds");

    if (!fileInput.files.length) {
        alert("Please upload a CSV file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const csvData = event.target.result;
        const rows = csvData.split("\n").map(row => row.split(","));
        let headers = rows.shift().map(header => header.trim());

        // Ensure headers exist
        const idIndex = headers.indexOf("ID");
        const nameIndex = headers.indexOf("Full Name");
        const phoneIndex = headers.indexOf("Phone Number");

        if (nameIndex === -1 || phoneIndex === -1) {
            alert("CSV must contain 'Full Name' and 'Phone Number' columns.");
            return;
        }

        let startingIndex = idIndex === -1 ? parseInt(startingIndexInput.value) || 1 : null;
        let moderateIds = new Set(moderateIdsInput.value.split(",").map(id => id.trim()).filter(id => id));
        let mildIds = new Set(mildIdsInput.value.split(",").map(id => id.trim()).filter(id => id));

        const categorizedData = rows.map((row, index) => {
            let id = idIndex !== -1 ? row[idIndex].trim() : startingIndex++;
            let name = row[nameIndex].trim();
            let phone = row[phoneIndex].trim();

            let category = "Severe";
            if (moderateIds.has(id)) category = "Moderate";
            if (mildIds.has(id)) category = "Mild";

            let contactName = `${id} - ${category} - ${name}`;
            return { contactName, phone };
        });

        generateVCF(categorizedData);
    };

    reader.readAsText(file);
}

function generateVCF(contacts) {
    let vcfContent = "";
    contacts.forEach(({ contactName, phone }) => {
        vcfContent += `BEGIN:VCARD\n`;
        vcfContent += `VERSION:3.0\n`;
        vcfContent += `PRODID:-//Apple Inc.//iPhone OS 18.3.1//EN\n`;
        vcfContent += `N:;${contactName};;;\n`;
        vcfContent += `FN:${contactName}\n`;
        vcfContent += `TEL;type=pref:+91${phone}\n`;
        vcfContent += `END:VCARD\n\n`;
    });

    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const link = document.getElementById("downloadLink");
    link.href = URL.createObjectURL(blob);
    link.style.display = "inline-block";
}
