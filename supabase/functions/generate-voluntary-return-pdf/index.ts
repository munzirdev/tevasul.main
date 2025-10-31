import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { formData } = await req.json()
    
    const gateTranslations: any = {
      "yayladağı": "كسب",
      "cilvegözü": "باب الهوى",
      "öncüpınar": "باب السلامة",
      "istanbul havalimanı": "مطار اسطنبول",
      "çobanbey": "الراعي",
      "zeytindalı": "غصن الزيتون",
      "karakamış": "جرابلس",
      "akçakale": "تل أبيض الحدودي"
    }

    const arabicGate = gateTranslations[formData.borderPoint] || formData.borderPoint
    
    // جدول المرافقين
    let refakatHTML = ""
    if (formData.refakatEntries && formData.refakatEntries.length > 0) {
      const rows = formData.refakatEntries
        .map((entry: any) => `<tr><td>${entry.id}</td><td>${entry.name}</td></tr>`)
        .join("")
      
      refakatHTML = `
        <br><br><b>REFAKATİMDEKİLER</b>
        <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Kimlik No</th>
              <th>İsim</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `
    }

    const gsmPart = formData.gsm ? `<br><br>GSM : ${formData.gsm}` : ""

    // توليد HTML للنموذج
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Gönüllü Dönüş Formu</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            font-size: 14px;
            line-height: 1.6;
        }
        .page { 
            page-break-after: always; 
            min-height: 800px;
            margin-bottom: 40px;
        }
        .header { 
            text-align: center; 
            font-weight: bold; 
            font-size: 16px;
            margin-bottom: 40px;
        }
        .content { 
            text-align: justify;
            margin-top: 30px;
        }
        .signature {
            text-align: right;
            margin-top: 80px;
            font-weight: bold;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
        }
        [dir="rtl"] {
            direction: rtl;
            text-align: right;
        }
    </style>
</head>
<body>
    <!-- Turkish Page -->
    <div class="page">
        <div class="header">
            İL GÖÇ İDARESİ MÜDÜRLÜĞÜ'NE<br>MERSİN
        </div>
        <div style="text-align: right;">${formData.travelDate}</div>
        <div class="content">
            Ben Suriye uyrukluyum. Adım ${formData.fullNameTR}. ${formData.kimlikNo} no'lu yabancı kimlik sahibiyim. ${formData.borderPoint.toUpperCase()} Sınır Kapısından Geçici koruma haklarımdan feraget ederek Suriye'ye gerekli gönüllü dönüş işlemin yapılması ve geçici koruma kimlik kaydımın iptal edilmesi için gereğinin yapılmasını saygımla arz ederim.
            ${refakatHTML}
            ${gsmPart}
        </div>
        <div class="signature">
            <b>AD SOYAD</b><br>${formData.fullNameTR}
        </div>
    </div>

    <!-- Arabic Page -->
    <div class="page" dir="rtl">
        <div class="header">
            إلى مديرية إدارة الهجرة<br>مرسين
        </div>
        <div style="text-align: right;">التاريخ: ${formData.travelDate}</div>
        <div class="content">
            أنا الموقّع أدناه ${formData.fullNameAR}، أحمل بطاقة الحماية المؤقتة رقم ${formData.kimlikNo}. أطلب منكم التفضل بتسليمي الأوراق اللازمة لتنفيذ إجراءات العودة الطوعية إلى سوريا عبر معبر ${arabicGate} الحدودي.<br>
            وتفضلوا بقبول فائق الاحترام والتقدير.
        </div>
        <div class="signature">
            <b>المقدّم/ة:</b><br>${formData.fullNameAR}
        </div>
    </div>
</body>
</html>
`

    // استخدام API مجاني لتحويل HTML إلى PDF
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        printBackground: true,
        format: 'A4'
      })
    })

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF')
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voluntary_return_${formData.kimlikNo}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

