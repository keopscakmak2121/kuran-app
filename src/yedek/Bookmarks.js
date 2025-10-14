// src/components/Bookmarks.js
import React, { useState, useEffect } from 'react';
import {
  getBookmarks,
  removeBookmark,
  updateBookmark,
  getBookmarksGroupedBySurah,
  getCategories,
  getBookmarksByCategory,
  getBookmarkStats
} from '../utils/bookmarkStorage';

const Bookmarks = ({ darkMode, onAyahClick }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [groupedBookmarks, setGroupedBookmarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('tümü');
  const [viewMode, setViewMode] = useState('list'); // list, grouped
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editCategory, setEditCategory] = useState('genel');
  const [stats, setStats] = useState(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const categories = getCategories();

  useEffect(() => {
    loadBookmarks();
  }, [selectedCategory, viewMode]);

  const loadBookmarks = () => {
    const allBookmarks = getBookmarksByCategory(selectedCategory);
    setBookmarks(allBookmarks);
    
    if (viewMode === 'grouped') {
      const grouped = getBookmarksGroupedBySurah();
      setGroupedBookmarks(grouped);
    }

    setStats(getBookmarkStats());
  };

  const handleDelete = (bookmarkId) => {
    if (window.confirm('Bu yer imini silmek istediğinize emin misiniz?')) {
      removeBookmark(bookmarkId);
      loadBookmarks();
    }
  };

  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
    setEditNote(bookmark.note || '');
    setEditCategory(bookmark.category || 'genel');
  };

  const handleSaveEdit = () => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, {
        note: editNote,
        category: editCategory
      });
      setEditingBookmark(null);
      loadBookmarks();
    }
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setEditNote('');
    setEditCategory('genel');
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📌';
  };

  // Liste görünümü
  const renderListView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {bookmarks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: darkMode ? '#9ca3af' : '#6b7280' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔖</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Henüz yer imi yok</div>
          <div style={{ fontSize: '14px' }}>Beğendiğiniz ayetleri yer imlerine ekleyin</div>
        </div>
      ) : (
        bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            style={{
              padding: '20px',
              backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
              borderRadius: '10px',
              border: '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {/* Başlık */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{getCategoryIcon(bookmark.category)}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: text }}>
                    {bookmark.surahName} - Ayet {bookmark.ayahNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    {new Date(bookmark.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onAyahClick && onAyahClick(bookmark.surahNumber, bookmark.ayahNumber)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  👁️ Görüntüle
                </button>
                <button
                  onClick={() => handleEdit(bookmark)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: darkMode ? '#6b7280' : '#d1d5db',
                    color: text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Arapça */}
            <div style={{
              fontSize: '18px',
              textAlign: 'right',
              lineHeight: '1.8',
              color: text,
              marginBottom: '10px',
              direction: 'rtl'
            }}>
              {bookmark.arabicText}
            </div>

            {/* Türkçe */}
            <div style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: text,
              marginBottom: bookmark.note ? '10px' : '0'
            }}>
              {bookmark.turkishText}
            </div>

            {/* Not */}
            {bookmark.note && (
              <div style={{
                padding: '12px',
                backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                borderRadius: '6px',
                borderLeft: '3px solid #059669',
                fontSize: '14px',
                color: text,
                fontStyle: 'italic'
              }}>
                📝 {bookmark.note}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Gruplu görünüm
  const renderGroupedView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {groupedBookmarks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: darkMode ? '#9ca3af' : '#6b7280' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔖</div>
          <div style={{ fontSize: '18px' }}>Henüz yer imi yok</div>
        </div>
      ) : (
        groupedBookmarks.map((group) => (
          <div key={group.surahNumber}>
            <h3 style={{ 
              fontSize: '20px', 
              color: text, 
              marginBottom: '15px',
              borderBottom: `2px solid #059669`,
              paddingBottom: '8px'
            }}>
              {group.surahName} ({group.bookmarks.length} ayet)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {group.bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  style={{
                    padding: '15px',
                    backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: text, marginBottom: '5px' }}>
                        <strong>Ayet {bookmark.ayahNumber}</strong> {getCategoryIcon(bookmark.category)}
                      </div>
                      <div style={{ fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {bookmark.turkishText.substring(0, 80)}...
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                      <button
                        onClick={() => onAyahClick && onAyahClick(bookmark.surahNumber, bookmark.ayahNumber)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDelete(bookmark.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Başlık ve İstatistikler */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', color: text }}>
          Yer İmleri
        </h2>
        
        {stats && (
          <div style={{
            padding: '12px',
            backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
            color: text
          }}>
            <strong>Toplam:</strong> {stats.total} ayet
            {stats.withNotes > 0 && <> • <strong>Notlu:</strong> {stats.withNotes}</>}
          </div>
        )}
      </div>

      {/* Filtreler */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setSelectedCategory('tümü')}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedCategory === 'tümü' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: selectedCategory === 'tümü' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Tümü
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === category.id ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
              color: selectedCategory === category.id ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Görünüm Modu */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'list' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: viewMode === 'list' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 Liste
        </button>
        
        <button
          onClick={() => setViewMode('grouped')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'grouped' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: viewMode === 'grouped' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📚 Surelere Göre
        </button>
      </div>

      {/* Yer İmi Düzenleme Modal */}
      {editingBookmark && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: cardBg,
            padding: '25px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ color: text, marginBottom: '20px' }}>Yer İmini Düzenle</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: text, fontSize: '14px' }}>
                Kategori:
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: darkMode ? '#4b5563' : 'white',
                  color: text,
                  fontSize: '14px'
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: text, fontSize: '14px' }}>
                Not:
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Bu ayet hakkında notunuz..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: darkMode ? '#4b5563' : 'white',
                  color: text,
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İçerik */}
      {viewMode === 'list' ? renderListView() : renderGroupedView()}
    </div>
  );
};

export default Bookmarks; 
