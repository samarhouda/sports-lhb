let panier = JSON.parse(localStorage.getItem("panier")) || [];

function sauvegarderPanier() {
    localStorage.setItem("panier", JSON.stringify(panier));
}

function trouverImageProduit(nom) {
    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];
    let produit = produitsAdmin.find(function(item) {
        return item.nom === nom;
    });

    return produit ? produit.image : "";
}

function normaliserPanier() {
    let panierNormalise = [];

    panier.forEach(function(produit) {
        let nom = produit.nom;
        let prix = Number(produit.prix);
        let quantite = Number(produit.quantite) || 1;
        let image = produit.image || trouverImageProduit(nom);
        let produitExistant = panierNormalise.find(function(item) {
            return item.nom === nom && item.prix === prix;
        });

        if (produitExistant) {
            produitExistant.quantite += quantite;
            if (!produitExistant.image && image) {
                produitExistant.image = image;
            }
        } else {
            panierNormalise.push({
                nom: nom,
                prix: prix,
                image: image,
                quantite: quantite
            });
        }
    });

    panier = panierNormalise;
    sauvegarderPanier();
}

function compterArticlesPanier() {
    return panier.reduce(function(total, produit) {
        return total + (Number(produit.quantite) || 1);
    }, 0);
}

function calculerTotalPanier() {
    return panier.reduce(function(total, produit) {
        let quantite = Number(produit.quantite) || 1;
        return total + (Number(produit.prix) * quantite);
    }, 0);
}

function copierProduitsCommande() {
    return panier.map(function(produit) {
        let quantite = Number(produit.quantite) || 1;
        let prix = Number(produit.prix);

        return {
            nom: produit.nom,
            prix: prix,
            image: produit.image || trouverImageProduit(produit.nom),
            quantite: quantite,
            sousTotal: prix * quantite
        };
    });
}

function getAvisKey(nomProduit) {
    return "avis_" + nomProduit;
}

function getAnciensCommentairesKey(nomProduit) {
    return "commentaires_" + nomProduit;
}

function obtenirAvisProduit(nomProduit) {
    let avis = JSON.parse(localStorage.getItem(getAvisKey(nomProduit))) || [];
    let anciensCommentaires = JSON.parse(localStorage.getItem(getAnciensCommentairesKey(nomProduit))) || [];

    anciensCommentaires.forEach(function(commentaire) {
        avis.push({
            nom: "Client",
            commentaire: commentaire,
            note: 0,
            date: ""
        });
    });

    return avis;
}

function afficherEtoiles(note) {
    let noteNombre = Number(note) || 0;
    let etoiles = "";

    for (let i = 1; i <= 5; i++) {
        etoiles += i <= noteNombre ? "★" : "☆";
    }

    return etoiles;
}

function calculerMoyenneAvis(nomProduit) {
    let avis = obtenirAvisProduit(nomProduit).filter(function(item) {
        return Number(item.note) > 0;
    });

    if (avis.length === 0) {
        return 0;
    }

    let total = avis.reduce(function(somme, item) {
        return somme + Number(item.note);
    }, 0);

    return Math.round((total / avis.length) * 10) / 10;
}

function texteMoyenneAvis(nomProduit) {
    let moyenne = calculerMoyenneAvis(nomProduit);

    if (moyenne === 0) {
        return "Aucun avis";
    }

    return afficherEtoiles(Math.round(moyenne)) + " " + moyenne + "/5";
}

// ===== PRODUITS INITIAUX =====

function initialiserProduits() {
    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin"));

    if (!produitsAdmin || produitsAdmin.length === 0) {
        produitsAdmin = [
            {
                nom: "Maillot Football",
                image: "images/maillot.jpg.avif",
                prix: 299,
                ancienPrix: 399,
                description: "Maillot confortable pour les matchs et les entraînements."
            },
            {
                nom: "Chaussures Running",
                image: "images/chaussures.jpg.webp",
                prix: 799,
                ancienPrix: 999,
                description: "Chaussures légères adaptées à la course et au fitness."
            },
            {
                nom: "Ballon Adidas",
                image: "images/ballon.jpg.webp",
                prix: 199,
                ancienPrix: 249,
                description: "Ballon résistant idéal pour le football."
            },
            {
                nom: "Survêtement Nike",
                image: "images/survetement.jpg.webp",
                prix: 399,
                ancienPrix: 499,
                description: "Survêtement sportif confortable et moderne."
            }
        ];

        localStorage.setItem("produitsAdmin", JSON.stringify(produitsAdmin));
    }
}

// ===== PANIER =====

function afficherPanier() {
    let panierBtn = document.getElementById("panier");

    if (panierBtn) {
        panierBtn.innerHTML = "&#128722; Panier : " + compterArticlesPanier();
    }
}

function ajouterPanier(nom, prix, image) {
    let prixProduit = Number(prix);
    let imageProduit = image || trouverImageProduit(nom);
    let produitExistant = panier.find(function(produit) {
        return produit.nom === nom && Number(produit.prix) === prixProduit;
    });

    if (produitExistant) {
        produitExistant.quantite = (Number(produitExistant.quantite) || 1) + 1;
        if (!produitExistant.image && imageProduit) {
            produitExistant.image = imageProduit;
        }
    } else {
        panier.push({
            nom: nom,
            prix: prixProduit,
            image: imageProduit,
            quantite: 1
        });
    }

    sauvegarderPanier();
    afficherPanier();

    alert(nom + " ajoute au panier");
}

function afficherProduitsPanier() {
    let liste = document.getElementById("liste-panier");
    let totalElement = document.getElementById("total");

    if (!liste) return;

    let total = 0;
    liste.innerHTML = "";

    if (panier.length === 0) {
        liste.innerHTML = `<p class="panier-vide">Votre panier est vide</p>`;
    }

    panier.forEach(function(produit, index) {
        let quantite = Number(produit.quantite) || 1;
        let sousTotal = Number(produit.prix) * quantite;
        total += sousTotal;

        liste.innerHTML += `
            <div class="panier-ligne">
                ${produit.image ? `<img src="${produit.image}" alt="${produit.nom}">` : ""}

                <div class="panier-info">
                    <h3>${produit.nom}</h3>
                    <p>${produit.prix} DH</p>
                    <strong>${sousTotal} DH</strong>
                </div>

                <div class="panier-actions">
                    <button onclick="diminuerQuantite(${index})">-</button>
                    <span>${quantite}</span>
                    <button onclick="augmenterQuantite(${index})">+</button>
                    <button onclick="supprimerProduitPanier(${index})" class="supprimer-panier">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    });

    if (totalElement) {
        totalElement.innerHTML = "Total : " + total + " DH";
    }
}

function augmenterQuantite(index) {
    panier[index].quantite = (Number(panier[index].quantite) || 1) + 1;
    sauvegarderPanier();
    afficherPanier();
    afficherProduitsPanier();
}

function diminuerQuantite(index) {
    let quantite = Number(panier[index].quantite) || 1;

    if (quantite <= 1) {
        supprimerProduitPanier(index);
        return;
    }

    panier[index].quantite = quantite - 1;
    sauvegarderPanier();
    afficherPanier();
    afficherProduitsPanier();
}

function supprimerProduitPanier(index) {
    panier.splice(index, 1);
    sauvegarderPanier();
    afficherPanier();
    afficherProduitsPanier();
}

function ouvrirWhatsAppPanier() {
    if (panier.length === 0) {
        alert("Votre panier est vide");
        return;
    }

    let infosClient = JSON.parse(localStorage.getItem("clientInfos")) || {};
    let lignesProduits = panier.map(function(produit) {
        let quantite = Number(produit.quantite) || 1;
        let prix = Number(produit.prix) || 0;
        let sousTotal = prix * quantite;

        return "- " + produit.nom + " x " + quantite + " = " + sousTotal + " DH";
    });

    let message = "Bonjour Sports LHB,%0A%0A";
    message += "Je souhaite commander :%0A";
    message += encodeURIComponent(lignesProduits.join("\n"));
    message += "%0A%0ATotal : " + calculerTotalPanier() + " DH";

    if (infosClient.nom) {
        message += "%0ANom : " + encodeURIComponent(infosClient.nom);
    }

    if (infosClient.ville) {
        message += "%0AVille : " + encodeURIComponent(infosClient.ville);
    }

    window.open("https://wa.me/212600000000?text=" + message, "_blank");
}

function viderPanier() {
    panier = [];
    sauvegarderPanier();

    afficherPanier();
    afficherProduitsPanier();

    alert("Panier vide");
}
// ===== FAVORIS =====

function ajouterFavori(nomProduit) {
    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

    favoris.push(nomProduit);

    localStorage.setItem("favoris", JSON.stringify(favoris));

    alert(nomProduit + " ajouté aux favoris ❤️");
}

function afficherFavoris() {
    let liste = document.getElementById("liste-favoris");

    if (!liste) return;

    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

    liste.innerHTML = "";

    favoris.forEach(function(item) {
        liste.innerHTML += `<p>❤️ ${item}</p>`;
    });
}

function viderFavoris() {
    localStorage.removeItem("favoris");
    afficherFavoris();
    alert("Favoris supprimés ✅");
}

// ===== RECHERCHE =====

function rechercherProduit() {
    let input = document.getElementById("recherche");

    if (!input) return;

    let mot = input.value.toLowerCase();
    let produits = document.querySelectorAll(".product");

    produits.forEach(function(produit) {
        produit.style.display = produit.innerText.toLowerCase().includes(mot)
            ? "block"
            : "none";
    });
}

// ===== NOTES =====

function noterProduit(nomProduit) {
    let nomClient = prompt("Votre nom :");

    if (nomClient === null) return;

    let commentaire = prompt("Votre commentaire :");

    if (commentaire === null) return;

    let note = prompt("Note pour " + nomProduit + " (1 a 5) :");

    if (note === null) return;

    note = Number(note);

    if (nomClient === "" || commentaire === "") {
        alert("Remplis ton nom et ton commentaire");
        return;
    }

    if (!Number.isInteger(note) || note < 1 || note > 5) {
        alert("Entre une note entre 1 et 5");
        return;
    }

    let avis = JSON.parse(localStorage.getItem(getAvisKey(nomProduit))) || [];

    avis.push({
        nom: nomClient,
        commentaire: commentaire,
        note: note,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(getAvisKey(nomProduit), JSON.stringify(avis));

    afficherProduitsAdminAccueil();

    alert("Merci pour votre avis : " + note + "/5");
}
// ===== DARK MODE =====

function darkMode() {
    document.body.classList.toggle("dark");
}

// ===== PROFIL =====

function chargerProfil() {
    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

    let fav = document.getElementById("nbrFavoris");
    let pan = document.getElementById("nbrPanier");

    if (fav) fav.innerHTML = favoris.length;
    if (pan) pan.innerHTML = compterArticlesPanier();
}

// ===== ADMIN PRODUITS =====

function ajouterProduitAdmin() {
    let nom = document.getElementById("nomProduit").value;
    let prix = document.getElementById("prixProduit").value;
    let ancienPrix = document.getElementById("ancienPrixProduit")?.value || "";
    let description = document.getElementById("descriptionProduit")?.value || "";
    let imageInput = document.getElementById("imageProduit");

    if (nom === "" || prix === "") {
        alert("Remplis le nom et le prix");
        return;
    }

    if (!imageInput || !imageInput.files || !imageInput.files[0]) {
        alert("Choisis une image");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
        let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];

        produitsAdmin.push({
            nom: nom,
            image: e.target.result,
            prix: Number(prix),
            ancienPrix: ancienPrix ? Number(ancienPrix) : "",
            description: description
        });

        localStorage.setItem("produitsAdmin", JSON.stringify(produitsAdmin));

        document.getElementById("nomProduit").value = "";
        document.getElementById("prixProduit").value = "";
        document.getElementById("imageProduit").value = "";

        if (document.getElementById("ancienPrixProduit")) {
            document.getElementById("ancienPrixProduit").value = "";
        }

        if (document.getElementById("descriptionProduit")) {
            document.getElementById("descriptionProduit").value = "";
        }

        afficherProduitsAdmin();
        afficherStatistiques();

        alert("Produit ajouté ✅");
    };

    reader.readAsDataURL(imageInput.files[0]);
}

function afficherProduitsAdmin() {
    let liste = document.getElementById("listeProduitsAdmin");

    if (!liste) return;

    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];

    liste.innerHTML = "";

    produitsAdmin.forEach(function(produit, index) {
        liste.innerHTML += `
            <div class="product">
                <img src="${produit.image}" alt="${produit.nom}">

                <h3>${produit.nom}</h3>
                <p>${produit.prix} DH</p>

                ${produit.ancienPrix ? `<p><del>${produit.ancienPrix} DH</del></p>` : ""}
                ${produit.ancienPrix ? `<strong class="promo">PROMO 🔥</strong>` : ""}

                <p>${produit.description || ""}</p>

                <button onclick="modifierProduitAdmin(${index})">
                    Modifier
                </button>

                <button onclick="supprimerProduitAdmin(${index})">
                    Supprimer
                </button>
            </div>
        `;
    });
}

function supprimerProduitAdmin(index) {
    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];

    produitsAdmin.splice(index, 1);

    localStorage.setItem("produitsAdmin", JSON.stringify(produitsAdmin));

    afficherProduitsAdmin();
    afficherProduitsAdminAccueil();
    afficherStatistiques();

    alert("Produit supprimé ✅");
}

function modifierProduitAdmin(index) {
    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];

    let nouveauNom = prompt("Nouveau nom :", produitsAdmin[index].nom);
    let nouveauPrix = prompt("Nouveau prix :", produitsAdmin[index].prix);
    let nouvelAncienPrix = prompt("Ancien prix :", produitsAdmin[index].ancienPrix || "");
    let nouvelleDescription = prompt("Description :", produitsAdmin[index].description || "");

    if (nouveauNom === null || nouveauPrix === null) {
        return;
    }

    produitsAdmin[index].nom = nouveauNom;
    produitsAdmin[index].prix = Number(nouveauPrix);
    produitsAdmin[index].ancienPrix = nouvelAncienPrix ? Number(nouvelAncienPrix) : "";
    produitsAdmin[index].description = nouvelleDescription;

    localStorage.setItem("produitsAdmin", JSON.stringify(produitsAdmin));

    afficherProduitsAdmin();
    afficherProduitsAdminAccueil();
    afficherStatistiques();

    alert("Produit modifié ✅");
}

function afficherProduitsAdminAccueil() {
    let container = document.querySelector(".product-container");

    if (!container) return;

    let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || [];

    container.innerHTML = "";

    produitsAdmin.forEach(function(produit) {
        container.innerHTML += `
            <div class="product">
                <img src="${produit.image}" alt="${produit.nom}">

                <h3>${produit.nom}</h3>

                <p>${produit.prix} DH</p>

                ${produit.ancienPrix ? `<p><del>${produit.ancienPrix} DH</del></p>` : ""}
                ${produit.ancienPrix ? `<strong class="promo">PROMO 🔥</strong>` : ""}

                <p class="note">${texteMoyenneAvis(produit.nom)}</p>

                <button onclick='ajouterPanier(${JSON.stringify(produit.nom)}, ${produit.prix}, ${JSON.stringify(produit.image)})'>
                    Acheter
                </button>

                <button onclick="ajouterFavori('${produit.nom}')">
                    ❤️ Favori
                </button>

                <button onclick="noterProduit('${produit.nom}')">
                    ⭐ Noter
                </button>

                <button onclick='voirDetails(${JSON.stringify(produit.nom)}, ${produit.prix}, ${JSON.stringify(produit.image)}, ${JSON.stringify(produit.description || "Produit sportif de haute qualité")})' class="details-btn">
    Voir Détails
</button>
            </div>
        `;
    });
}

// ===== COMMANDES =====

function validerCommande() {
    let nom = document.getElementById("clientNom").value;
    let tel = document.getElementById("clientTel").value;
    let ville = document.getElementById("clientVille").value;

    if (nom === "" || tel === "" || ville === "") {
        alert("Remplis tous les champs");
        return;
    }

    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
    let produitsCommande = copierProduitsCommande();
    let totalCommande = calculerTotalPanier();

    commandes.push({
        nom: nom,
        tel: tel,
        ville: ville,
        date: new Date().toLocaleString(),
        produits: produitsCommande,
        total: totalCommande,
        nombreProduits: compterArticlesPanier()
    });

    localStorage.setItem("commandes", JSON.stringify(commandes));
    localStorage.setItem("clientInfos", JSON.stringify({
        nom: nom,
        ville: ville
    }));

    document.getElementById("clientNom").value = "";
    document.getElementById("clientTel").value = "";
    document.getElementById("clientVille").value = "";

    alert("Commande envoyée avec succès ✅");
}

function afficherCommandes() {
    let liste = document.getElementById("listeCommandes");

    if (!liste) return;

    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    liste.innerHTML = "";

    commandes.forEach(function(cmd, index) {
        let produitsCommande = cmd.produits || [];
        let totalCommande = Number(cmd.total) || 0;
        let produitsHtml = `<p class="commande-vide">Aucun detail produit disponible pour cette commande.</p>`;

        if (produitsCommande.length > 0) {
            produitsHtml = produitsCommande.map(function(produit) {
                let quantite = Number(produit.quantite) || 1;
                let prix = Number(produit.prix) || 0;
                let sousTotal = Number(produit.sousTotal) || (prix * quantite);

                return `
                    <div class="commande-produit">
                        ${produit.image ? `<img src="${produit.image}" alt="${produit.nom}">` : ""}

                        <div>
                            <strong>${produit.nom}</strong>
                            <p>${quantite} x ${prix} DH = ${sousTotal} DH</p>
                        </div>
                    </div>
                `;
            }).join("");
        }

        liste.innerHTML += `
            <div class="commande-card">
                <h3>Commande ${index + 1}</h3>
                <p><b>Nom :</b> ${cmd.nom}</p>
                <p><b>Telephone :</b> ${cmd.tel}</p>
                <p><b>Ville :</b> ${cmd.ville}</p>
                <p><b>Date :</b> ${cmd.date}</p>
                <p><b>Total :</b> ${totalCommande} DH</p>

                <div class="commande-details">
                    <h4>Produits commandes</h4>
                    ${produitsHtml}
                </div>

                <button onclick="supprimerCommande(${index})">
                    Supprimer
                </button>
            </div>
        `;
    });
}
function supprimerCommande(index) {
    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    commandes.splice(index, 1);

    localStorage.setItem("commandes", JSON.stringify(commandes));

    afficherCommandes();
    afficherStatistiques();

    alert("Commande supprimée ✅");
}

// ===== STATISTIQUES =====

function afficherStatistiques(){

    let produits = JSON.parse(localStorage.getItem("produitsAdmin")) || [];
    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

    let revenus = 0;
    let produitsVendus = 0;
    let ventesParProduit = {};
    let clients = [];

    commandes.forEach(function(cmd){
        revenus += Number(cmd.total) || 0;

        let clientId = (cmd.tel || "") + "-" + (cmd.nom || "") + "-" + (cmd.ville || "");
        if (clientId !== "--" && !clients.includes(clientId)) {
            clients.push(clientId);
        }

        let produitsCommande = cmd.produits || [];

        produitsCommande.forEach(function(produit) {
            let quantite = Number(produit.quantite) || 1;
            produitsVendus += quantite;

            if (!ventesParProduit[produit.nom]) {
                ventesParProduit[produit.nom] = 0;
            }

            ventesParProduit[produit.nom] += quantite;
        });

        if (produitsCommande.length === 0 && cmd.nombreProduits) {
            produitsVendus += Number(cmd.nombreProduits) || 0;
        }
    });

    let topProduit = "Aucun";
    let meilleureVente = 0;

    Object.keys(ventesParProduit).forEach(function(nomProduit) {
        if (ventesParProduit[nomProduit] > meilleureVente) {
            meilleureVente = ventesParProduit[nomProduit];
            topProduit = nomProduit + " (" + meilleureVente + ")";
        }
    });

    if(document.getElementById("totalProduits")){
        document.getElementById("totalProduits").innerHTML = produits.length;
    }

    if(document.getElementById("totalCommandes")){
        document.getElementById("totalCommandes").innerHTML = commandes.length;
    }

    if(document.getElementById("totalFavoris")){
        document.getElementById("totalFavoris").innerHTML = favoris.length;
    }

    if(document.getElementById("totalRevenus")){
        document.getElementById("totalRevenus").innerHTML = revenus;
    }

    if(document.getElementById("totalProduitsVendus")){
        document.getElementById("totalProduitsVendus").innerHTML = produitsVendus;
    }

    if(document.getElementById("totalClients")){
        document.getElementById("totalClients").innerHTML = clients.length;
    }

    if(document.getElementById("topProduitVendu")){
        document.getElementById("topProduitVendu").innerHTML = topProduit;
    }
}
// ===== LOGIN ADMIN =====

function connexionAdmin() {
    let user = document.getElementById("adminUser").value;
    let pass = document.getElementById("adminPass").value;

    if (user === "admin" && pass === "1234") {
        alert("Connexion réussie ✅");
        window.location.href = "admin.html";
    } else {
        alert("Utilisateur ou mot de passe incorrect ❌");
    }
}

// ===== DETAILS PRODUIT =====

function voirDetails(nom, prix, image, description) {
    let produit = {
        nom: nom,
        prix: prix,
        image: image,
        description: description
    };

    localStorage.setItem("produitDetail", JSON.stringify(produit));

    window.location.href = "details.html";
}

function afficherDetailsProduit() {
    let nom = document.getElementById("detailNom");

    if (!nom) return;

    let produit = JSON.parse(localStorage.getItem("produitDetail"));

    if (!produit) return;

    document.getElementById("detailImage").src = produit.image;
    document.getElementById("detailNom").innerHTML = produit.nom;
    document.getElementById("detailPrix").innerHTML = produit.prix + " DH";
    document.getElementById("detailDescription").innerHTML =
        produit.description || "Produit sportif de haute qualité.";

    afficherMoyenneDetails(produit.nom);

    document.getElementById("btnAcheter").onclick = function() {
        ajouterPanier(produit.nom, produit.prix);
    };

    afficherCommentaires();
}

// ===== AVIS CLIENTS =====

function ajouterCommentaire() {
    let nomInput = document.getElementById("nomClientAvis");
    let noteInput = document.getElementById("noteAvis");
    let commentaireInput = document.getElementById("commentaire");

    if (!nomInput || !noteInput || !commentaireInput) return;

    let nomClient = nomInput.value.trim();
    let commentaire = commentaireInput.value.trim();
    let note = Number(noteInput.value);

    if (nomClient === "" || commentaire === "") {
        alert("Remplis ton nom et ton commentaire");
        return;
    }

    if (!Number.isInteger(note) || note < 1 || note > 5) {
        alert("Choisis une note entre 1 et 5");
        return;
    }

    let produit = JSON.parse(localStorage.getItem("produitDetail"));

    if (!produit) return;

    let avis = JSON.parse(localStorage.getItem(getAvisKey(produit.nom))) || [];

    avis.push({
        nom: nomClient,
        commentaire: commentaire,
        note: note,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(getAvisKey(produit.nom), JSON.stringify(avis));

    nomInput.value = "";
    noteInput.value = "";
    commentaireInput.value = "";

    afficherCommentaires();
    afficherMoyenneDetails(produit.nom);
}

function afficherMoyenneDetails(nomProduit) {
    let moyenneElement = document.getElementById("detailMoyenneAvis");

    if (!moyenneElement) return;

    moyenneElement.innerHTML = "Avis : " + texteMoyenneAvis(nomProduit);
}

function afficherCommentaires() {
    let liste = document.getElementById("listeCommentaires");

    if (!liste) return;

    let produit = JSON.parse(localStorage.getItem("produitDetail"));

    if (!produit) return;

    let avis = obtenirAvisProduit(produit.nom);

    liste.innerHTML = "";

    if (avis.length === 0) {
        liste.innerHTML = `<p class="avis-vide">Aucun avis pour ce produit.</p>`;
        return;
    }

    avis.forEach(function(item) {
        liste.innerHTML += `
            <div class="avis-client">
                <div class="avis-entete">
                    <strong>${item.nom || "Client"}</strong>
                    <span>${item.note ? afficherEtoiles(item.note) : "Sans note"}</span>
                </div>
                <p>${item.commentaire}</p>
            </div>
        `;
    });
}
// ===== LANCEMENT AUTOMATIQUE =====

initialiserProduits();
normaliserPanier();

afficherPanier();
afficherProduitsPanier();
afficherFavoris();
chargerProfil();
afficherProduitsAdmin();
afficherProduitsAdminAccueil();
afficherCommandes();
afficherStatistiques();
afficherDetailsProduit();
