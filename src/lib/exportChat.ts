import { Message } from "@/hooks/useChats";

export const exportChatAsText = (chatTitle: string, messages: Message[]) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  let content = `Chat: ${chatTitle}\n`;
  content += `Exported: ${new Date().toLocaleString()}\n`;
  content += `${'='.repeat(50)}\n\n`;

  messages.forEach((message) => {
    const sender = message.is_user ? 'You' : 'AI';
    const timestamp = formatDate(message.created_at);
    
    content += `[${timestamp}] ${sender}:\n`;
    content += `${message.content}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportChatAsPDF = async (chatTitle: string, messages: Message[]) => {
  // Import jsPDF dynamically
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    
    yPosition += 5;
  };

  // Title
  addText(chatTitle, 16, true);
  addText(`Exported: ${new Date().toLocaleString()}`, 10);
  yPosition += 5;

  // Messages
  messages.forEach((message) => {
    const sender = message.is_user ? 'You' : 'AI';
    const timestamp = new Date(message.created_at).toLocaleString();
    
    addText(`[${timestamp}] ${sender}:`, 11, true);
    addText(message.content, 10);
  });

  doc.save(`${chatTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`);
};
