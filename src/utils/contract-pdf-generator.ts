import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export interface ContractPdfData {
  contractNumber: string;
  clientName: string;
  equipmentName: string;
  createdAt: Date | Timestamp;
  contractActivationDate?: Date | Timestamp; // Date d'activation
  contractEndDate: Date | Timestamp;
  paymentSchedule?: string;
  paymentStatus?: string;
  isActive?: boolean;
}

export const downloadContractPdf = async (data: ContractPdfData, download: boolean = true) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set font size and style
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  
  // Add title
  doc.text('CONTRAT DE MAINTENANCE', 105, 20, { align: 'center' });
  
  // Add contract number
  doc.setFontSize(12);
  doc.text(`N° ${data.contractNumber}`, 105, 30, { align: 'center' });
  
  // Add company logo or header if available
  // doc.addImage('logo.png', 'PNG', 10, 10, 50, 20);
  
  // Add horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Parties section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTRE LES SOUSSIGNÉS', 20, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'La société CLIMATECH SERVICES, SARL au capital de 50 000 €,',
    'immatriculée au RCS de Paris sous le numéro 123 456 789,',
    'dont le siège social est situé au 123 Avenue de la Climatisation, 75001 Paris,',
    'représentée par M. Jean Dupont, en sa qualité de Directeur Général,',
    'ci-après dénommée "le Prestataire",',
    '',
    'ET',
    '',
    `${data.clientName},`,
    'ci-après dénommé "le Client",'
  ], 20, 55);
  
  // Contract object
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IL A ÉTÉ CONVENU CE QUI SUIT', 20, 100);
  
  doc.setFontSize(12);
  doc.text('Article 1 : Objet du contrat', 20, 110);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    `Le présent contrat a pour objet la maintenance préventive et corrective de l'équipement suivant :`,
    `${data.equipmentName}.`,
    '',
    'Le Prestataire s\'engage à effectuer les prestations de maintenance selon les modalités définies ci-après.'
  ], 20, 120);
  
  // Dates and duration
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 2 : Durée du contrat', 20, 145);
  
  // Convert dates if they are Firestore Timestamps
  const startDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
  const endDate = data.contractEndDate instanceof Timestamp ? data.contractEndDate.toDate() : data.contractEndDate;
  
  // Calculate activation date if not provided
  let activationDate;
  if (data.contractActivationDate) {
    activationDate = data.contractActivationDate instanceof Timestamp 
      ? data.contractActivationDate.toDate() 
      : data.contractActivationDate;
  } else {
    activationDate = new Date(startDate);
    activationDate.setDate(activationDate.getDate() + 14);
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    `Le présent contrat prend effet à compter du ${format(startDate, 'dd MMMM yyyy', { locale: fr })}.`,
    `Il sera pleinement actif à partir du ${format(activationDate, 'dd MMMM yyyy', { locale: fr })}, après la période d'activation de 14 jours.`,
    `Il est conclu pour une durée déterminée jusqu'au ${format(endDate, 'dd MMMM yyyy', { locale: fr })}.`
  ], 20, 155);
  
  // Activation period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 3 : Période d\'activation', 20, 175);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Le présent contrat est soumis à une période d\'activation de 14 jours calendaires à compter de sa signature.',
    'Durant cette période :',
    '- Le Client peut résilier le contrat sans pénalité ni justification par lettre recommandée avec accusé de réception.',
    '- Aucun paiement ne sera exigé du Client pendant cette période.',
    '- Le Prestataire s\'engage à ne pas débuter les prestations avant la fin de cette période, sauf demande expresse du Client.',
    '',
    'À l\'issue de cette période de 14 jours, et en l\'absence de résiliation par le Client, le contrat sera considéré comme',
    'définitivement conclu et les obligations des parties prendront pleinement effet.'
  ], 20, 185);
  
  // Add a new page for more content
  doc.addPage();
  
  // Services description
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 4 : Description des prestations', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Les prestations de maintenance préventive comprennent :',
    '- Inspection régulière de l\'équipement',
    '- Nettoyage des composants',
    '- Vérification des paramètres de fonctionnement',
    '- Remplacement des pièces d\'usure courante',
    '- Mise à jour des logiciels si applicable',
    '',
    'Les prestations de maintenance corrective comprennent :',
    '- Diagnostic des pannes',
    '- Réparation ou remplacement des pièces défectueuses',
    '- Remise en service de l\'équipement'
  ], 20, 30);
  
  // Payment terms
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 5 : Conditions financières', 20, 76);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Le montant annuel des prestations de maintenance est fixé selon le barème en vigueur au jour de la signature du contrat.',
    `Modalité de paiement : ${data.paymentSchedule || 'Annuel'}`,
    `État actuel du paiement : ${data.paymentStatus || 'En attente'}`,
    '',
    'Les factures sont payables à 30 jours date de facture. Tout retard de paiement entraînera l\'application de pénalités',
    'de retard au taux d\'intérêt légal majoré de 5 points, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement',
    'de 40 euros, conformément aux articles L.441-6 et D.441-5 du Code de commerce.'
  ], 20, 80);
  
  // Responsibilities
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 6 : Responsabilités', 20, 110);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Le Prestataire s\'engage à exécuter les prestations avec diligence et conformément aux règles de l\'art.',
    'Sa responsabilité est limitée à la réparation des dommages directs prouvés par le Client et plafonnée au montant',
    'annuel du contrat. Le Prestataire ne pourra en aucun cas être tenu responsable des dommages indirects ou immatériels',
    'tels que perte de production, perte de profit, perte de chance, etc.',
    '',
    'Le Client s\'engage à utiliser l\'équipement conformément à sa destination et aux préconisations du fabricant.',
    'Il s\'engage également à signaler sans délai toute anomalie ou dysfonctionnement constaté.'
  ], 20, 120);
  
  // Termination
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 7 : Résiliation', 20, 150);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Le contrat peut être résilié par l\'une ou l\'autre des parties en cas de manquement grave de l\'autre partie à ses',
    'obligations, non réparé dans un délai de 30 jours suivant mise en demeure adressée par lettre recommandée avec',
    'accusé de réception.',
    '',
    'En cas de résiliation anticipée du fait du Client, les sommes déjà versées resteront acquises au Prestataire et',
    'les sommes dues au titre de l\'année en cours deviendront immédiatement exigibles.'
  ], 20, 160);
  
  // Add a new page for more content
  doc.addPage();
  
  // Confidentiality
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 8 : Confidentialité', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Chaque partie s\'engage à considérer comme confidentielles toutes les informations qu\'elle pourrait obtenir dans',
    'le cadre de l\'exécution du présent contrat, et à ne pas les divulguer à des tiers sans l\'accord préalable et',
    'écrit de l\'autre partie, pendant toute la durée du contrat et pendant les deux années suivant son expiration.'
  ], 20, 30);
  
  // Force majeure
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 9 : Force majeure', 20, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Aucune des parties ne pourra être tenue responsable d\'un manquement à l\'une de ses obligations en cas de',
    'survenance d\'un événement de force majeure tel que défini par l\'article 1218 du Code civil et la jurisprudence',
    'des tribunaux français.',
    '',
    'La partie invoquant un cas de force majeure devra en informer l\'autre partie dans les plus brefs délais et par',
    'tout moyen. Les obligations des parties seront suspendues jusqu\'à la cessation du cas de force majeure.'
  ], 20, 60);
  
  // Applicable law
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Article 10 : Droit applicable et juridiction compétente', 20, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Le présent contrat est soumis au droit français.',
    '',
    'En cas de litige relatif à la formation, l\'interprétation, l\'exécution ou la résiliation du présent contrat,',
    'les parties s\'efforceront de trouver une solution amiable. À défaut d\'accord amiable dans un délai de 30 jours,',
    'le litige sera soumis aux tribunaux compétents de Paris, auxquels les parties attribuent compétence exclusive,',
    'nonobstant pluralité de défendeurs ou appel en garantie.'
  ], 20, 100);
  
  // Signatures
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Fait en deux exemplaires originaux.', 20, 130);
  
  doc.text('À Paris, le ' + format(new Date(), 'dd MMMM yyyy', { locale: fr }), 20, 140);
  
  doc.text('Pour le Prestataire', 50, 160);
  doc.text('Pour le Client', 150, 160);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature précédée de la mention', 50, 170);
  doc.text('"Lu et approuvé"', 50, 175);
  
  doc.text('Signature précédée de la mention', 150, 170);
  doc.text('"Lu et approuvé"', 150, 175);
  
  // Generate PDF blob
  const pdfBlob = doc.output('blob');
  
  // If download is true, save the PDF, otherwise return the blob
  if (download) {
    // Create a URL for the blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrat_${data.contractNumber}_${data.clientName.replace(/\s+/g, '_')}.pdf`;
    
    // Append to the document, click and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  // Return the blob for viewing in browser
  return pdfBlob;
};
