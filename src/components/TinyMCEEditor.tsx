import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  onInsertVariable?: (variable: string) => void;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  content,
  onChange,
  placeholder = '',
  isDarkMode,
  onInsertVariable
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // محاكاة تحميل TinyMCE
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  const insertVariableAtCursor = (variable: string) => {
    // إدراج المتغير في الموضع المحدد في المحرر
    const editor = (window as any).tinymce?.get('tinymce-editor');
    if (editor) {
      editor.insertContent(variable);
    } else {
      // fallback: إضافة في نهاية النص
      const newContent = content + variable;
      onChange(newContent);
    }
  };

  const addTurkishTemplate = () => {
    const template = `İL GÖÇ İDARESİ MÜDÜRLÜĞÜNE
{city}		{date}

	

Ben, {nationality} uyrukluyum , Adım {full_name} ,{id_number}  numaralı Geçici Koruma Kimlik Belgesi sahibiyim.
{content}

GSM : {phone_number}  
Saygılarımla,
Adı Soyadı: {full_name}
Kimlik No: {id_number}  
İmza: {signature}`;
    onChange(template);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-white dark:bg-slate-800 rounded-xl border border-white/30 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">جاري تحميل TinyMCE Editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-white dark:bg-slate-800 rounded-xl border border-white/30 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">❌</div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white dark:bg-slate-800 rounded-xl border border-white/30 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-lg">📝</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TinyMCE Editor</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={addTurkishTemplate}
            className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            title="إضافة قالب عريضة تركية"
          >
            <span className="ml-1">📄</span>
            قالب تركي
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            ✨ محرر نصوص متقدم
          </div>
        </div>
      </div>

      {/* TinyMCE Editor */}
      <div className="h-full">
                          <Editor
           id="tinymce-editor"
           apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "q4ilba4ym3huvfbnobhdtydwjafrgu6wh1efdz6qvteiwkvb"}
           value={content}
           onEditorChange={handleEditorChange}
          init={{
                         height: 450,
            menubar: false,
            directionality: 'rtl',
            language: 'ar',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
                         toolbar: 'undo redo | blocks | ' +
               'bold italic forecolor | alignleft aligncenter ' +
               'alignright alignjustify | bullist numlist outdent indent | ' +
               'removeformat | variables | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                color: ${isDarkMode ? '#e2e8f0' : '#1e293b'};
                background-color: ${isDarkMode ? '#1e293b' : '#ffffff'};
                direction: rtl;
                text-align: right;
              }
              .mce-content-body {
                direction: rtl;
                text-align: right;
              }
            `,
            skin: isDarkMode ? 'oxide-dark' : 'oxide',
            content_css: isDarkMode ? 'dark' : 'default',
            placeholder: placeholder || 'اكتب محتوى العريضة هنا...',
                         setup: (editor) => {
               // إضافة أزرار مخصصة
               editor.ui.registry.addButton('turkish_template', {
                 text: 'قالب تركي',
                 onAction: () => {
                   addTurkishTemplate();
                 }
               });

               // إضافة قائمة المتغيرات
               editor.ui.registry.addMenuButton('variables', {
                 text: 'متغيرات',
                 fetch: (callback) => {
                   const items = [
                     {
                       type: 'menuitem',
                       text: '👤 الاسم الكامل',
                       onAction: () => editor.insertContent('{full_name}')
                     },
                     {
                       type: 'menuitem',
                       text: '🆔 رقم الهوية',
                       onAction: () => editor.insertContent('{id_number}')
                     },
                     {
                       type: 'menuitem',
                       text: '📞 رقم الهاتف',
                       onAction: () => editor.insertContent('{phone_number}')
                     },
                     {
                       type: 'menuitem',
                       text: '🏙️ المدينة',
                       onAction: () => editor.insertContent('{city}')
                     },
                     {
                       type: 'menuitem',
                       text: '🌍 الجنسية',
                       onAction: () => editor.insertContent('{nationality}')
                     },
                     {
                       type: 'menuitem',
                       text: '📝 المحتوى',
                       onAction: () => editor.insertContent('{content}')
                     },
                     {
                       type: 'menuitem',
                       text: '📅 التاريخ',
                       onAction: () => editor.insertContent('{date}')
                     },
                     {
                       type: 'menuitem',
                       text: '✍️ التوقيع',
                       onAction: () => editor.insertContent('{signature}')
                     }
                   ];
                   callback(items);
                 }
               });
             }
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xs text-slate-500 dark:text-slate-400">إجراءات سريعة:</span>
            <button
              onClick={() => {
                const simpleTemplate = `İL GÖÇ İDARESİ MÜDÜRLÜĞÜNE

{city}		{date}

Ben, {nationality} uyrukluyum , Adım {full_name} ,{id_number}  numaralı Geçici Koruma Kimlik Belgesi sahibiyim.

{content}

GSM : {phone_number}  
Saygılarımla,
Adı Soyadı: {full_name}
Kimlik No: {id_number}  
İmza: {signature}`;
                onChange(simpleTemplate);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
            >
              📝 قالب بسيط
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            💡 استخدم أزرار التنسيق للحصول على مظهر احترافي
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinyMCEEditor;
