import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useMemo } from 'react';
import { Star, Edit, Trash2, User, MessageSquare, ArrowLeft } from 'lucide-react';

const API_BASE_URL = "http://192.168.111.189:3000";

type Review = {
  id: number;
  spaceId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type RatingStats = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
};

function getCurrentUserId() {
  const userInfo = localStorage.getItem("user_info");
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      return Number(parsed.id ?? parsed.userId ?? 0);
    } catch {
      return 0;
    }
  }

  return Number(localStorage.getItem("userId") || 0);
}

export const Route = createFileRoute('/rating_ulasan')({
    component: RatingUlasan,
  });

export default function RatingUlasan() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const SPACE_ID = Number(searchParams.get("spaceId") || 0);
  const BOOKING_ID = Number(searchParams.get("bookingId") || 0);
  const CURRENT_USER_ID = getCurrentUserId();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats>({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchData = async () => {
    if (!SPACE_ID) {
      setErrorMessage("Data space tidak ditemukan. Buka halaman ulasan dari Booking Saya.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token");

      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reviews/space/${SPACE_ID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_BASE_URL}/reviews/space/${SPACE_ID}/rating`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!reviewsRes.ok || !statsRes.ok) {
        throw new Error("Gagal mengambil data");
      }

      const fetchedReviews = await reviewsRes.json();
      const fetchedStats = await statsRes.json();

      setReviews(fetchedReviews.data || fetchedReviews);
      setStats({
        averageRating: fetchedStats?.data?.averageRating ??
                      fetchedStats?.averageRating ??
                      0,
        totalReviews: fetchedStats?.data?.totalReviews ??
                      fetchedStats?.totalReviews ??
                      0,
        distribution: fetchedStats?.data?.distribution ??
                      fetchedStats?.distribution ??
                      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setErrorMessage("Gagal mengambil data ulasan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Silakan berikan rating (bintang) terlebih dahulu.");
      return;
    }

    if (!BOOKING_ID || !SPACE_ID) {
      alert("Data booking tidak lengkap. Buka halaman ulasan dari Booking Saya.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingId) {
        // PUT /reviews/:id
        await fetch(`${API_BASE_URL}/reviews/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating,
            comment,
          }),
        });
      } else {
        // POST /reviews
        const res = await fetch(`${API_BASE_URL}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            bookingId: BOOKING_ID,
            spaceId: SPACE_ID,
            rating,
            comment,
          }),
        });

        const result = await res.json();
        console.log(result);

        if (!res.ok) {
          throw new Error(result.message || "Gagal menambah review");
        }
      }

      resetForm();
      await fetchData();
      window.location.href = "/booking_user";
    } catch (error) {
      console.error("Gagal menyimpan ulasan:", error);
      setErrorMessage(error instanceof Error ? error.message : "Gagal menyimpan ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    // Scroll ke form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
      try {
        // DELETE /reviews/:id
        await fetch(`${API_BASE_URL}/reviews/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await fetchData();
      } catch (error) {
        console.error("Gagal menghapus ulasan:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setRating(0);
    setComment('');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500 font-medium animate-pulse">Memuat Ulasan...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">

      <button 
          onClick={() => window.location.href = "/booking_user"}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Booking Saya
        </button>

      {errorMessage && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm">
          {errorMessage}
        </div>
      )}
      
      {/* HEADER & STATS (GET /reviews/space/:spaceId/rating) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ulasan Ruangan</h2>
          <p className="text-gray-500 text-sm mt-1">Bagikan pengalaman Anda menggunakan ruangan ini</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end">
          <div className="flex items-center space-x-2">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <span className="text-4xl font-bold text-gray-800">{Number(stats?.averageRating || 0).toFixed(1)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Berdasarkan {stats?.totalReviews || 0} ulasan</p>
        </div>
      </div>

      {/* FORM INPUT RATING (POST /reviews & PUT /reviews/:id) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingId ? 'Ubah Ulasan Anda' : 'Tulis Ulasan Anda'}
        </h3>
        <form onSubmit={handleSubmit}>
          
          {/* Star Rating Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Penilaian</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Komentar (Opsional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda di sini..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white font-medium flex items-center shadow-sm ${
                isSubmitting 
                ? 'bg-amber-400 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600 hover:shadow-md transition-all'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Kirim Ulasan')}
            </button>
          </div>
        </form>
      </div>

      {/* REVIEW LIST (GET /reviews/space/:spaceId) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">Semua Ulasan</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada ulasan untuk ruangan ini.</p>
            <p className="text-gray-400 text-sm">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-hover hover:border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {review.userName || `User #${review.userId}`}{review.userId === CURRENT_USER_ID && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">Anda</span>}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions for current user (PUT/DELETE) */}
                  {review.userId === CURRENT_USER_ID && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(review)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Ulasan">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(review.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Ulasan">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
