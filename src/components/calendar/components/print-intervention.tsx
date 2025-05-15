import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Printer, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function PrintIntervention() {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<any>(null);
  const [associatedProject, setAssociatedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Récupérer les données du rendez-vous
        const appointmentRef = doc(db, 'appointments', id);
        const appointmentSnap = await getDoc(appointmentRef);
        
        if (appointmentSnap.exists()) {
          const appointmentData = {
            id: appointmentSnap.id,
            ...appointmentSnap.data() as any
          };
          setAppointment(appointmentData);
          
          // Rechercher le projet associé
          const projectsRef = collection(db, 'projects');
          const q = query(projectsRef, where('name', '==', appointmentData.title));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const projectData = querySnapshot.docs[0].data();
            setAssociatedProject({
              id: querySnapshot.docs[0].id,
              ...projectData
            });
            
            // Log pour déboguer les données de contact
            console.log("Données de contact du projet:", {
              projectContact: projectData.clientData?.contact,
              projectClient: projectData.client
            });
          } else {
            // Essayer de trouver par ID
            const projectDocRef = doc(db, 'projects', id);
            const projectSnapshot = await getDoc(projectDocRef);
            
            if (projectSnapshot.exists()) {
              const projectData = projectSnapshot.data();
              setAssociatedProject({
                id,
                ...projectData
              });
              
              // Log pour déboguer les données de contact
              console.log("Données de contact du projet (par ID):", {
                projectContact: projectData.clientData?.contact,
                projectClient: projectData.client
              });
            }
          }
          
          // Log pour déboguer les données de contact de l'appointment
          console.log("Données de contact de l'appointment:", {
            appointmentContact: appointmentData.contact,
            appointmentClient: appointmentData.client
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDownloadPDF = () => {
    const content = document.getElementById('print-content');
    if (!content) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `intervention_${appointment?.id?.substring(0, 8) || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      output: 'blob'
    };

    // Masquer temporairement les boutons pour l'export
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) actionButtons.style.display = 'none';
    
    html2pdf().set(opt).from(content).outputPdf('blob').then((pdfBlob: Blob) => {
      // Réafficher les boutons après l'export
      if (actionButtons) actionButtons.style.display = 'flex';
      
      // Créer une URL pour le blob PDF
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Ouvrir dans un nouvel onglet
      window.open(blobUrl, '_blank');
    });
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement de la fiche d'intervention...</div>;
  }
  
  if (!appointment) {
    return <div className="flex justify-center items-center h-screen">Intervention non trouvée</div>;
  }
  
  const products = associatedProject?.products || [];
  const formattedDate = appointment.date ? format(new Date(appointment.date), 'dd MMMM yyyy', { locale: fr }) : 'Date non spécifiée';
  
  return (
    <>
      <div id="action-buttons" className="fixed top-4  flex gap-2 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
        >
          <Download className="w-4 h-4" />
          Ouvrir PDF
        </button>
      </div>

      <div id="print-content" className="print-container p-8 max-w-4xl mx-auto bg-white">
        {/* En-tête */}
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">FICHE D'INTERVENTION</h1>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Référence: {appointment.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-sm">Date d'édition: {format(new Date(), 'dd/MM/yyyy', { locale: fr })}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Date d'intervention: {formattedDate}</p>
              <p>Heure: {appointment.time || 'Non spécifiée'}</p>
            </div>
          </div>
        </div>
        
        {/* Informations client */}
        <div className="mb-6 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 bg-gray-100 p-2">INFORMATIONS CLIENT</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">Client:</span> {appointment.client?.name || 'Non spécifié'}</p>
              <p><span className="font-semibold">Adresse:</span> {appointment.client?.address || appointment.client?.postalCode || 'Non spécifiée'}</p>
            </div>
          </div>
        </div>
        
        {/* Détails de l'intervention */}
        <div className="mb-6 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 bg-gray-100 p-2">DÉTAILS DE L'INTERVENTION</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <p><span className="font-semibold">Date:</span> {formattedDate}</p>
            <p><span className="font-semibold">Heure:</span> {appointment.time || 'Non spécifiée'}</p>
            <p><span className="font-semibold">Durée estimée:</span> {appointment.duration || 'Non spécifiée'}</p>
            <p><span className="font-semibold">Équipe:</span> {appointment.team || 'Non assignée'}</p>
          </div>
          
          {/* Commentaires */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Commentaires:</h3>
            <div className="border border-gray-200 rounded p-3 min-h-[100px] bg-gray-50">
              {appointment.commentaires && appointment.commentaires.length > 0 ? (
                appointment.commentaires.map((comment: any, index: number) => (
                  <div key={index} className="mb-2">
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                    {index < appointment.commentaires.length - 1 && <hr className="my-2" />}
                  </div>
                ))
              ) : associatedProject?.commentaires && associatedProject.commentaires.length > 0 ? (
                associatedProject.commentaires.map((comment: any, index: number) => (
                  <div key={index} className="mb-2">
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                    {index < associatedProject.commentaires.length - 1 && <hr className="my-2" />}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Aucun commentaire</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Liste des produits */}
        <div className="mb-6 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 bg-gray-100 p-2">PRODUITS À INSTALLER</h2>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product: any, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 border border-gray-400 mr-3 mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    {product.type && product.type !== "unknown-type" ? (
                      <p className="text-sm text-gray-600">Type: {product.type}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start">
              <div className="w-6 h-6 border border-gray-400 mr-3 mt-1 flex-shrink-0"></div>
              <div>
                <p className="font-semibold">{appointment.title}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Reste à charge */}
        {associatedProject?.RAC && associatedProject.RAC.hasToCollect && (
          <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-amber-50">
            <h2 className="text-lg font-semibold mb-2 bg-amber-100 p-2">RESTE À CHARGE</h2>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Montant à collecter:</p>
              <p className="text-xl font-bold">{associatedProject.RAC.amount} €</p>
            </div>
          </div>
        )}
        
        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="border-t border-gray-300 pt-2">
            <p className="font-semibold">Signature du technicien</p>
            <div className="h-24 border border-gray-300 rounded mt-2"></div>
          </div>
          {/* <div className="border-t border-gray-300 pt-2">
            <p className="font-semibold">Signature du client</p>
            <div className="h-24 border border-gray-300 rounded mt-2"></div>
          </div> */}
        </div>
      </div>
      
      {/* Styles d'impression */}
      <style>
        {`
          @media print {
            body {
              font-size: 12pt;
              color: black;
              background-color: white;
            }
            .print-container {
              padding: 0;
              max-width: 100%;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
            #action-buttons {
              display: none !important;
            }
          }
          
          @media screen {
            body {
              background-color: #f5f5f5;
            }
            .print-container {
              background-color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin: 2rem auto;
              border-radius: 8px;
            }
          }
        `}
      </style>
    </>
  );
}