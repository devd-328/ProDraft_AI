import { jsPDF } from 'jspdf'

// Export as plain text file
export function exportAsTxt(content, filename = 'prodraft-export') {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export as PDF
export function exportAsPdf(content, filename = 'prodraft-export') {
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  
  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ProDraft AI Export', 20, 20)
  
  // Add date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 28)
  
  // Add content
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  
  // Split text to fit page width
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  
  const lines = doc.splitTextToSize(content, maxWidth)
  
  let y = 40
  const lineHeight = 6
  const pageHeight = doc.internal.pageSize.getHeight()
  
  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage()
      y = 20
    }
    doc.text(line, margin, y)
    y += lineHeight
  }
  
  doc.save(`${filename}.pdf`)
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
