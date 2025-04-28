const PDFDocument = require('pdfkit');

async function generatePDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            bufferPages: true
        });
        
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        
        // Cabeçalho
        doc.fillColor('#1F2937')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text(data.pessoal.nome.toUpperCase(), { align: 'center' });
        
        doc.fillColor('#6B7280')
           .font('Helvetica')
           .fontSize(14)
           .text(data.pessoal.profissao, { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Linha divisória (verde)
        doc.strokeColor('#10B981')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        
        doc.moveDown(1);
        
        // Informações de contato
        const contactInfo = [];
        if (data.pessoal.email) contactInfo.push(data.pessoal.email);
        if (data.pessoal.telefone) contactInfo.push(data.pessoal.telefone);
        
        doc.fillColor('#6B7280')
           .font('Helvetica')
           .fontSize(10)
           .text(contactInfo.join(' | '), { align: 'center', lineGap: 5 });
        
        doc.moveDown(1.5);
        
        // Experiência Profissional
        doc.fillColor('#1F2937')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text('EXPERIÊNCIA PROFISSIONAL', { underline: true });
        
        doc.moveDown(0.5);
        
        data.experiencias.forEach((exp, index) => {
            doc.fillColor('#1F2937')
               .font('Helvetica-Bold')
               .fontSize(12)
               .text(`${exp.cargo} | ${exp.empresa}`, { lineGap: 5 });
            
            doc.fillColor('#6B7280')
               .font('Helvetica')
               .fontSize(10)
               .list(exp.descricao.split('\n').filter(line => line.trim()), {
                   bulletRadius: 2,
                   textIndent: 10,
                   lineGap: 3
               });
            
            if (index < data.experiencias.length - 1) {
                doc.moveDown(0.5);
            }
        });
        
        doc.moveDown(1);
        
        // Formação Acadêmica
        doc.fillColor('#1F2937')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text('FORMAÇÃO ACADÊMICA', { underline: true });
        
        doc.moveDown(0.5);
        
        data.formacoes.forEach((form, index) => {
            doc.fillColor('#1F2937')
               .font('Helvetica-Bold')
               .fontSize(12)
               .text(form.curso, { lineGap: 3 });
            
            doc.fillColor('#6B7280')
               .font('Helvetica')
               .text(form.instituicao, { lineGap: 5 });
            
            if (index < data.formacoes.length - 1) {
                doc.moveDown(0.5);
            }
        });
        
        doc.moveDown(1);
        
        // Habilidades Técnicas
        doc.fillColor('#1F2937')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text('HABILIDADES TÉCNICAS', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fillColor('#6B7280')
           .font('Helvetica')
           .fontSize(11)
           .text(data.habilidadesTecnicas.join(', '));
        
        doc.moveDown(1);
        
        // Idiomas
        doc.fillColor('#1F2937')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text('IDIOMAS', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fillColor('#6B7280')
           .font('Helvetica')
           .fontSize(11)
           .text(data.idiomas.join(', '));
        
        // Rodapé
        doc.page.margins.bottom = 20;
        doc.on('pageAdded', () => {
            doc.fillColor('#6B7280')
               .font('Helvetica')
               .fontSize(8)
               .text(
                   'Currículo gerado por Currículo Rápido',
                   doc.page.width - 50,
                   doc.page.height - 20,
                   { align: 'right' }
               );
        });
        
        doc.end();
    });
}

module.exports = { generatePDF };