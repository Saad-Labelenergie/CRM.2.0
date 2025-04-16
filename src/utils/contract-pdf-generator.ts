import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// Interface pour les données minimales requises pour générer un PDF de contrat
export interface ContractPdfData {
  contractNumber: string;
  clientName: string;
  equipmentName: string;
  createdAt?: Timestamp | string | Date;
  contractEndDate?: Timestamp | string | Date;
  // Champs optionnels supplémentaires
  paymentSchedule?: string;
  nextPaymentDueDate?: Timestamp;
  paymentStatus?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  price?: number;
  subsidyAmount?: number;
}

/**
 * Formate une date Timestamp ou string en format lisible
 */
export const formatDate = (date: Timestamp | string | Date | undefined) => {
  if (!date) return '-';
  
  if (typeof date === 'string') {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  }
  
  if (date instanceof Date) {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  }
  
  // Si c'est un Timestamp Firebase
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return format(date.toDate(), 'dd/MM/yyyy', { locale: fr });
  }
  
  return '-';
};

/**
 * Génère un PDF de contrat à partir des données fournies
 */
export const generateContractPdf = async (data: ContractPdfData): Promise<jsPDF> => {
  // Créer un nouveau document PDF
  const pdf = new jsPDF();
  
  try {
    // Ajouter un en-tête stylisé
    pdf.setFillColor(0, 32, 96); // Couleur bleu foncé pour les en-têtes
    pdf.rect(0, 0, 210, 15, 'F');
    pdf.setTextColor(255, 255, 255); // Texte blanc
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Contrat de Maintenance', 105, 10, { align: 'center' });
    
    // Réinitialiser les couleurs
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Section Informations Logement & Résident
    pdf.setFillColor(0, 32, 96);
    pdf.rect(0, 25, 210, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations Client & Équipement', 105, 32, { align: 'center' });
    
    // Réinitialiser les couleurs
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Créer une grille d'informations
    pdf.setFontSize(10);
    
    // Colonne gauche
    let leftY = 45;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client:', 20, leftY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.clientName || 'N/A', 60, leftY);
    leftY += 10;
    
    if (data.address || data.postalCode || data.city) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Adresse:', 20, leftY);
      pdf.setFont('helvetica', 'normal');
      const address = [
        data.address || '',
        `${data.postalCode || ''} ${data.city || ''}`.trim()
      ].filter(Boolean).join(', ');
      pdf.text(address || 'N/A', 60, leftY);
      leftY += 10;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Équipement:', 20, leftY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.equipmentName || 'N/A', 60, leftY);
    leftY += 10;
    
    // Colonne droite
    let rightY = 45;
    pdf.setFont('helvetica', 'bold');
    pdf.text('N° de contrat:', 120, rightY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.contractNumber || 'N/A', 160, rightY);
    rightY += 10;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date de début:', 120, rightY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(data.createdAt) || format(new Date(), 'dd/MM/yyyy', { locale: fr }), 160, rightY);
    rightY += 10;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date de fin:', 120, rightY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(data.contractEndDate) || format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'dd/MM/yyyy', { locale: fr }), 160, rightY);
    rightY += 10;
    
    // Section Détails du Projet
    const maxY = Math.max(leftY, rightY) + 10;
    pdf.setFillColor(0, 32, 96);
    pdf.rect(0, maxY, 210, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails du Contrat', 105, maxY + 7, { align: 'center' });
    
    // Réinitialiser les couleurs
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Tableau des détails
    let tableY = maxY + 20;
    pdf.setFontSize(10);
    
    // En-tête du tableau
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableY, 170, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prestation', 30, tableY + 7);
    pdf.text('Montant', 150, tableY + 7);
    tableY += 10;
    
    // Ligne du tableau
    pdf.setFont('helvetica', 'normal');
    pdf.text('Maintenance ' + data.equipmentName, 30, tableY + 7);
    pdf.text(`${data.price?.toLocaleString('fr-FR') || '?'} €`, 150, tableY + 7);
    tableY += 10;
    
    // Ligne pour les aides si disponibles
    if (data.subsidyAmount) {
      pdf.text('Aides & Subventions', 30, tableY + 7);
      pdf.text(`${data.subsidyAmount.toLocaleString('fr-FR')} €`, 150, tableY + 7);
      tableY += 10;
    }
    
    // Total
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableY, 170, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total', 30, tableY + 7);
    const total = (data.price || 0) - (data.subsidyAmount || 0);
    pdf.text(`${total.toLocaleString('fr-FR')} €`, 150, tableY + 7);
    tableY += 20;
    
    // Informations de paiement
    if (data.paymentSchedule || data.paymentStatus) {
      pdf.setFillColor(0, 32, 96);
      pdf.rect(0, tableY, 210, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text('Informations de Paiement', 105, tableY + 7, { align: 'center' });
      
      // Réinitialiser les couleurs
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      tableY += 20;
      pdf.setFontSize(10);
      
      if (data.paymentSchedule) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Échéancier:', 20, tableY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentSchedule, 80, tableY);
        tableY += 10;
      }
      
      if (data.paymentStatus) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Statut du paiement:', 20, tableY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentStatus, 80, tableY);
        tableY += 10;
      }
      
      if (data.nextPaymentDueDate) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Prochain paiement:', 20, tableY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatDate(data.nextPaymentDueDate), 80, tableY);
        tableY += 10;
      }
    }
    
    // Pied de page avec signature
    tableY += 20;
    pdf.line(20, tableY, 190, tableY);
    tableY += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Document généré le: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, 20, tableY);
    
    tableY += 20;
    pdf.text('Signature du client:', 20, tableY);
    pdf.text('Signature du prestataire:', 120, tableY);
    
    // Note légale en bas de page
    pdf.setFontSize(8);
    pdf.text('* Ce document est un contrat de maintenance. Les conditions générales de vente sont disponibles sur demande.', 20, 280);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    // Créer un PDF d'erreur simple
    pdf.setFontSize(16);
    pdf.text('Erreur lors de la génération du contrat', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('Veuillez contacter le support technique.', 105, 40, { align: 'center' });
  }
  
  return pdf;
};

/**
 * Télécharge un PDF de contrat
 */
export const downloadContractPdf = async (data: ContractPdfData): Promise<void> => {
  try {
    console.log('Début du téléchargement du PDF avec les données:', data);
    
    const pdf = await generateContractPdf(data);
    
    // Télécharger le PDF
    const filename = `contrat_${data.contractNumber || 'sans_numero'}_${(data.clientName || 'client').replace(/\s+/g, '_')}.pdf`;
    console.log('Téléchargement du fichier:', filename);
    
    pdf.save(filename);
    console.log('PDF téléchargé avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du contrat. Veuillez réessayer.');
    throw error;
  }
};