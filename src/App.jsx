import { useState, useMemo, useRef } from "react";
import { Search, X, Plus, ShoppingBag, ChevronDown, Camera, Heart } from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Libre+Franklin:wght@400;500;600&display=swap');
`;

const TYPES = {
  Fire:     { grad: ["#FF8A4C", "#C7420F"], ink: "#2A0E02" },
  Water:    { grad: ["#5FB2EA", "#155A96"], ink: "#02182A" },
  Grass:    { grad: ["#7BC96F", "#2F6B34"], ink: "#0C1F0D" },
  Electric: { grad: ["#FFDE59", "#D9A400"], ink: "#2B2000" },
  Psychic:  { grad: ["#E58BC9", "#9A3E82"], ink: "#280A20" },
  Dragon:   { grad: ["#9E8DF0", "#4F3FA6"], ink: "#0F0A26" },
  Fighting: { grad: ["#E08A4E", "#8C4014"], ink: "#241002" },
  Dark:     { grad: ["#8A7C72", "#372B22"], ink: "#0C0805" },
  Normal:   { grad: ["#D4CFC0", "#98917E"], ink: "#211E17" },
};

function TypeIcon({ type, size = 34, color = "#fff" }) {
  const p = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const box = { width: size, height: size, viewBox: "0 0 24 24" };
  switch (type) {
    case "Fire":
      return <svg {...box}><path {...p} d="M12 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1.5 1 2 3 2 5a6 6 0 1 1-12 0c0-3 1.5-5 3-6.5C10 6 10.5 4 12 2z" /></svg>;
    case "Water":
      return <svg {...box}><path {...p} d="M12 3c3 4 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7 12 3z" /></svg>;
    case "Grass":
      return <svg {...box}><path {...p} d="M12 21V9M12 9C8 9 5 6 5 3c4 0 7 2 7 6zM12 13c4 0 7-2.5 7-6-4 0-7 2-7 6z" /></svg>;
    case "Electric":
      return <svg {...box}><path {...p} d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>;
    case "Psychic":
      return <svg {...box}><circle {...p} cx="12" cy="12" r="8" /><path {...p} d="M12 4v16M4 12h16" strokeOpacity="0.5" /></svg>;
    case "Dragon":
      return <svg {...box}><path {...p} d="M4 18c3-1 4-4 4-7 2 2 2 5 1 7 3-1 6-4 6-9 0-3-2-6-5-7 1 3-1 5-3 5-3 0-5-2-5-5-2 2-3 5-2 8 0 2 1 3 3 3" /></svg>;
    case "Fighting":
      return <svg {...box}><path {...p} d="M6 12h4M6 8h6M6 16h6M14 4v16M18 8v8" /></svg>;
    case "Dark":
      return <svg {...box}><path {...p} d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 1 0 10.5 10.5z" /></svg>;
    default:
      return <svg {...box}><circle {...p} cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" fill={color} /></svg>;
  }
}

const RARITIES = ["Common", "Uncommon", "Rare", "Rare Holo", "Ultra Rare"];
const RARITY_DOTS = { Common: 1, Uncommon: 2, Rare: 3, "Rare Holo": 4, "Ultra Rare": 5 };
const CONDITIONS = ["Played", "Excellent", "Near Mint", "Mint"];
const VARIANTS = ["Standard", "V", "VMAX", "VSTAR", "GX", "EX"];
const GRADING = ["Ungraded", "Graded"];
const GRADING_COMPANIES = ["PSA", "BGS", "CGC", "SGC"];

const SEED = [];

function RarityDots({ rarity, color }) {
  const n = RARITY_DOTS[rarity] || 1;
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 99, background: i < n ? color : "rgba(255,255,255,0.18)" }} />
      ))}
    </div>
  );
}

function CardFace({ listing, onClick, isWishlisted, onToggleWishlist }) {
  const t = TYPES[listing.type];
  const hasPhoto = Boolean(listing.photo);
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (onClick && (e.key === "Enter" || e.key === " ")) onClick(); }}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: 5,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})`,
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      className="card-face"
    >
      <div style={{ position: "relative", aspectRatio: "5 / 7", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", background: `linear-gradient(160deg, ${t.grad[0]}, ${t.grad[1]})`, color: t.ink }}>
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(listing); }}
            style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 24, height: 24, borderRadius: 99, background: "rgba(0,0,0,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <Heart size={13} color={isWishlisted ? "#FF5C7A" : "#fff"} fill={isWishlisted ? "#FF5C7A" : "none"} />
          </button>
        )}
        {hasPhoto ? (
          <>
            <img src={listing.photo} alt={listing.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.35) 100%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 10px 0" }}>
              <div style={{ width: 22, height: 22, borderRadius: 99, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TypeIcon type={listing.type} size={13} color="#fff" />
              </div>
              {listing.variant && listing.variant !== "Standard" && (
                <div style={{ background: "rgba(0,0,0,0.5)", color: "#FFD874", fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 12, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(255,216,116,0.5)", marginRight: onToggleWishlist ? 26 : 0 }}>
                  {listing.variant}
                </div>
              )}
            </div>
            <div style={{ position: "relative", marginTop: "auto", padding: "0 10px 9px", color: "#fff" }}>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.15, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{listing.name}</div>
              <div style={{ fontFamily: "Libre Franklin, sans-serif", fontSize: 10.5, opacity: 0.85 }}>{listing.set}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px 0" }}>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 17, lineHeight: 1.1, paddingRight: onToggleWishlist ? 26 : 0 }}>
                {listing.name}{listing.variant && listing.variant !== "Standard" ? ` ${listing.variant}` : ""}
              </div>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: 12, opacity: 0.85, whiteSpace: "nowrap" }}>HP {listing.hp}</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 99, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TypeIcon type={listing.type} size={32} color={t.ink} />
              </div>
            </div>
            <div style={{ padding: "0 12px 10px" }}>
              <div style={{ fontFamily: "Libre Franklin, sans-serif", fontSize: 10.5, opacity: 0.85 }}>{listing.set} · {listing.num}</div>
              <div style={{ fontFamily: "Libre Franklin, sans-serif", fontSize: 9.5, opacity: 0.7, marginTop: 2 }}>No photo yet</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 4px" }}>
        <RarityDots rarity={listing.rarity} color={t.grad[0]} />
        <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F3EE" }}>${listing.price}</div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 99,
        fontFamily: "Libre Franklin, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        border: `1px solid ${active ? "#FFB000" : "rgba(255,255,255,0.14)"}`,
        background: active ? "#FFB00022" : "transparent",
        color: active ? "#FFCB4D" : "#B9B8C0",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [listings, setListings] = useState(SEED);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [rarityFilter, setRarityFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [view, setView] = useState("market");
  const [purchases, setPurchases] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [payment, setPayment] = useState({ name: "", number: "", expiry: "", cvc: "" });

  const paymentMissing = !payment.name
    ? "Add the name on the card"
    : !payment.number || payment.number.replace(/\s/g, "").length < 12
    ? "Add a valid card number"
    : !payment.expiry
    ? "Add the expiry date"
    : !payment.cvc
    ? "Add the CVC"
    : null;

  const payAndBuy = () => {
    if (paymentMissing || !checkoutItem) return;
    buy(checkoutItem);
    setPayment({ name: "", number: "", expiry: "", cvc: "" });
    setCheckoutItem(null);
    setView("purchases");
  };

  const toggleWishlist = (listing) => {
    setWishlist((prev) =>
      prev.some((w) => w.id === listing.id) ? prev.filter((w) => w.id !== listing.id) : [listing, ...prev]
    );
  };
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [form, setForm] = useState({ name: "", set: "", type: "Fire", rarity: "Common", variant: "Standard", condition: "Near Mint", grading: "Ungraded", gradingCompany: "PSA", grade: "", price: "", photo: "", description: "" });
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Downscale to a max width and re-encode as JPEG so a full-size
        // phone photo doesn't blow past the storage size limit.
        const maxWidth = 480;
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        } catch (err) {
          dataUrl = reader.result; // fallback: original, uncompressed
        }
        setForm((f) => ({ ...f, photo: dataUrl }));
      };
      img.onerror = () => setForm((f) => ({ ...f, photo: reader.result }));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const filtered = useMemo(() => {
    let list = listings.filter((l) => {
      if (query && !`${l.name} ${l.set}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter && l.type !== typeFilter) return false;
      if (rarityFilter && l.rarity !== rarityFilter) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [listings, query, typeFilter, rarityFilter, sort]);

  const buy = (listing) => {
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    setPurchases((prev) => [{ ...listing, boughtAt: Date.now() }, ...prev]);
    setWishlist((prev) => prev.filter((w) => w.id !== listing.id));
    setSelected(null);
    showToast(`Bought ${listing.name} (${listing.set}) for $${listing.price}`);
  };

  const missingReason = !form.photo
    ? "Add a photo to continue"
    : !form.name
    ? "Add a card name to continue"
    : !form.set
    ? "Add a set to continue"
    : !form.price
    ? "Add a price to continue"
    : form.grading === "Graded" && !form.grade
    ? "Add a grade to continue"
    : null;

  const submitListing = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (missingReason) return;
    const newListing = {
      id: Date.now(),
      name: form.name,
      set: form.set,
      num: "—",
      type: form.type,
      rarity: form.rarity,
      variant: form.variant,
      condition: form.condition,
      grading: form.grading,
      gradingCompany: form.grading === "Graded" ? form.gradingCompany : "",
      grade: form.grading === "Graded" ? form.grade : "",
      description: form.description,
      hp: 70 + Math.floor(Math.random() * 60),
      price: Number(form.price),
      seller: "You",
      mine: true,
      photo: form.photo,
    };
    setListings((prev) => [newListing, ...prev]);
    setSellOpen(false);
    setForm({ name: "", set: "", type: "Fire", rarity: "Common", variant: "Standard", condition: "Near Mint", grading: "Ungraded", gradingCompany: "PSA", grade: "", price: "", photo: "", description: "" });
    showToast(`Listed ${newListing.name} for $${newListing.price}`);
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, #084F47 0%, #052824 55%, #03130F 100%)", color: "#F5F3EE", fontFamily: "Libre Franklin, sans-serif" }}>
      <style>{FONTS}{`
        .card-face:hover { transform: translateY(-3px); }
        select, input { color-scheme: dark; }
        ::placeholder { color: #6E6D78; }
        .back-link:hover { color: #F5F3EE; text-decoration: underline; }
        .flame-water-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 26px;
          letter-spacing: 0.4px;
          background-image: linear-gradient(100deg,
            #FFE9A8 0%, #FFB020 10%, #E3540F 24%, #7A1E02 38%,
            #142230 48%, #0B4C7A 58%, #1C8FD1 74%, #8FE0FF 90%, #EAFBFF 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(-1px 0.5px 5px rgba(255,120,20,0.4)) drop-shadow(2px 0.5px 6px rgba(50,160,255,0.4));
        }
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(10,46,42,0.72)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div
            onClick={() => { setView("market"); setCheckoutItem(null); }}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <span className="flame-water-text">PokeTrade</span>
          </div>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6E6D78" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards or sets..."
              style={{ width: "100%", background: "#1B1B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 12px 9px 34px", fontSize: 14, color: "#F5F3EE", outline: "none" }}
            />
          </div>
          <button
            onClick={() => setView(view === "wishlist" ? "market" : "wishlist")}
            style={{
              position: "relative", display: "flex", alignItems: "center", gap: 6,
              background: view === "wishlist" ? "rgba(255,255,255,0.12)" : "transparent",
              border: "1px solid rgba(255,255,255,0.18)", color: "#F5F3EE", fontWeight: 600,
              fontFamily: "Rajdhani, sans-serif", fontSize: 15, borderRadius: 10, padding: "9px 16px", cursor: "pointer",
            }}
          >
            <Heart size={16} /> Wishlist
            {wishlist.length > 0 && (
              <span style={{ background: "#FF5C7A", color: "#20050B", fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "1px 6px", marginLeft: 2 }}>{wishlist.length}</span>
            )}
          </button>
          <button
            onClick={() => setView(view === "purchases" ? "market" : "purchases")}
            style={{
              position: "relative", display: "flex", alignItems: "center", gap: 6,
              background: view === "purchases" ? "rgba(255,255,255,0.12)" : "transparent",
              border: "1px solid rgba(255,255,255,0.18)", color: "#F5F3EE", fontWeight: 600,
              fontFamily: "Rajdhani, sans-serif", fontSize: 15, borderRadius: 10, padding: "9px 16px", cursor: "pointer",
            }}
          >
            <ShoppingBag size={16} /> My purchases
            {purchases.length > 0 && (
              <span style={{ background: "#FFB000", color: "#1A1200", fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "1px 6px", marginLeft: 2 }}>{purchases.length}</span>
            )}
          </button>
          <button
            onClick={() => setSellOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 15, border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
          >
            <Plus size={16} /> Sell a card
          </button>
        </div>
        {view === "market" && (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px 14px", display: "flex", gap: 8, overflowX: "auto" }}>
          <Chip active={!typeFilter} onClick={() => setTypeFilter(null)}>All types</Chip>
          {Object.keys(TYPES).map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}>{t}</Chip>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)} style={{ background: "#1B1B22", border: "1px solid rgba(255,255,255,0.12)", color: "#B9B8C0", borderRadius: 8, fontSize: 13, padding: "6px 10px" }}>
              <option value="">Any rarity</option>
              {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "#1B1B22", border: "1px solid rgba(255,255,255,0.12)", color: "#B9B8C0", borderRadius: 8, fontSize: 13, padding: "6px 10px" }}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 60px" }}>
        {view === "checkout" ? (
          checkoutItem ? (
            <div style={{ maxWidth: 480, margin: "0 auto" }}>
              <button
                onClick={() => { setView("market"); setCheckoutItem(null); }}
                className="back-link"
                style={{ background: "none", border: "none", color: "#cfe9e4", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, transition: "color 0.15s ease" }}
              >
                ← Back to marketplace
              </button>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Checkout</div>

              <div style={{ display: "flex", gap: 14, background: "#17171D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ width: 76, flexShrink: 0 }}>
                  <CardFace listing={checkoutItem} onClick={() => {}} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                  <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 17 }}>
                    {checkoutItem.name}{checkoutItem.variant && checkoutItem.variant !== "Standard" ? ` ${checkoutItem.variant}` : ""}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#8B8B95" }}>{checkoutItem.set} · Seller: {checkoutItem.seller}</div>
                  <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 20, marginTop: 4 }}>${checkoutItem.price}</div>
                </div>
              </div>

              <div style={{ background: "#17171D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Payment details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Name on card">
                    <input value={payment.name} onChange={(e) => setPayment({ ...payment, name: e.target.value })} placeholder="Ash Ketchum" style={inputStyle} />
                  </Field>
                  <Field label="Card number">
                    <input value={payment.number} onChange={(e) => setPayment({ ...payment, number: e.target.value })} placeholder="4242 4242 4242 4242" style={inputStyle} />
                  </Field>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Expiry">
                        <input value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM/YY" style={inputStyle} />
                      </Field>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="CVC">
                        <input value={payment.cvc} onChange={(e) => setPayment({ ...payment, cvc: e.target.value })} placeholder="123" style={inputStyle} />
                      </Field>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={payAndBuy}
                  disabled={Boolean(paymentMissing)}
                  style={{ marginTop: 18, width: "100%", background: paymentMissing ? "#3A3A44" : "#FFB000", color: paymentMissing ? "#77767F" : "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 16, border: "none", borderRadius: 10, padding: "12px", cursor: paymentMissing ? "not-allowed" : "pointer" }}
                >
                  {paymentMissing || `Pay $${checkoutItem.price}`}
                </button>
                <div style={{ marginTop: 12, fontSize: 11.5, color: "#6E6D78", textAlign: "center" }}>
                  Demo checkout — no real payment is processed.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#cfe9e4" }}>
              <div style={{ fontSize: 14, marginBottom: 18 }}>Nothing to check out right now.</div>
              <button
                onClick={() => setView("market")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 15, border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
              >
                Browse the marketplace
              </button>
            </div>
          )
        ) : view === "wishlist" ? (
          <>
            <button
              onClick={() => setView("market")}
              className="back-link"
              style={{ background: "none", border: "none", color: "#cfe9e4", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, transition: "color 0.15s ease" }}
            >
              ← Back to marketplace
            </button>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 4 }}>Wishlist</div>
            <div style={{ marginBottom: 20, fontSize: 13, color: "#cfe9e4" }}>{wishlist.length} card{wishlist.length !== 1 ? "s" : ""} saved</div>
            {wishlist.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#cfe9e4" }}>
                <Heart size={30} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 20, fontWeight: 600, color: "#F5F3EE", marginBottom: 6 }}>Your wishlist is empty</div>
                <div style={{ fontSize: 14, marginBottom: 18 }}>Tap the heart on any card to save it here.</div>
                <button
                  onClick={() => setView("market")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 15, border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
                >
                  Browse the marketplace
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {wishlist.map((w) => {
                  const stillListed = listings.some((l) => l.id === w.id);
                  return (
                    <div key={w.id}>
                      <CardFace
                        listing={w}
                        onClick={() => stillListed && setSelected(listings.find((l) => l.id === w.id))}
                        isWishlisted={true}
                        onToggleWishlist={toggleWishlist}
                      />
                      {!stillListed && (
                        <div style={{ padding: "6px 4px 0", fontSize: 11.5, color: "#cfe9e4" }}>No longer available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : view === "purchases" ? (
          <>
            <button
              onClick={() => setView("market")}
              className="back-link"
              style={{ background: "none", border: "none", color: "#cfe9e4", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, transition: "color 0.15s ease" }}
            >
              ← Back to marketplace
            </button>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 4 }}>My purchases</div>
            <div style={{ marginBottom: 20, fontSize: 13, color: "#cfe9e4" }}>{purchases.length} card{purchases.length !== 1 ? "s" : ""} bought</div>
            {purchases.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#cfe9e4" }}>
                <ShoppingBag size={30} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 20, fontWeight: 600, color: "#F5F3EE", marginBottom: 6 }}>You haven't bought any cards yet</div>
                <div style={{ fontSize: 14, marginBottom: 18 }}>Cards you buy will show up here.</div>
                <button
                  onClick={() => setView("market")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 15, border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
                >
                  Browse the marketplace
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {purchases.map((p) => (
                  <div key={p.id + "-" + p.boughtAt}>
                    <CardFace listing={p} onClick={() => {}} />
                    <div style={{ padding: "6px 4px 0", fontSize: 11.5, color: "#cfe9e4" }}>
                      Bought {new Date(p.boughtAt).toLocaleDateString()} · {p.seller}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
        <div style={{ marginBottom: 16, fontSize: 13, color: "#8B8B95" }}>{filtered.length} card{filtered.length !== 1 ? "s" : ""} listed</div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#cfe9e4" }}>
            {listings.length === 0 ? (
              <>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 20, fontWeight: 600, color: "#F5F3EE", marginBottom: 6 }}>No cards listed yet</div>
                <div style={{ fontSize: 14, marginBottom: 18 }}>Be the first to list a card for sale.</div>
                <button
                  onClick={() => setSellOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 15, border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
                >
                  <Plus size={16} /> Sell a card
                </button>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 20, fontWeight: 600, color: "#F5F3EE", marginBottom: 6 }}>No cards match that search</div>
                <div style={{ fontSize: 14 }}>Try a different name, type, or rarity.</div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {filtered.map((l) => (
              <CardFace
                key={l.id}
                listing={l}
                onClick={() => setSelected(l)}
                isWishlisted={wishlist.some((w) => w.id === l.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
          </>
        )}
      </main>

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#17171D", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", maxWidth: 420, width: "100%", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#8B8B95", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 130, flexShrink: 0 }}>
                <CardFace listing={selected} onClick={() => {}} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 22 }}>
                  {selected.name}{selected.variant && selected.variant !== "Standard" ? ` ${selected.variant}` : ""}
                </div>
                <div style={{ fontSize: 13, color: "#8B8B95" }}>{selected.set} · #{selected.num}</div>
                <div style={{ fontSize: 13, color: "#8B8B95" }}>{selected.rarity} · {selected.condition} condition</div>
                <div style={{ fontSize: 13, color: "#8B8B95" }}>
                  {selected.grading === "Graded" ? `Graded · ${selected.gradingCompany} ${selected.grade}` : "Ungraded"}
                </div>
                <div style={{ fontSize: 13, color: "#8B8B95" }}>Seller: {selected.seller}</div>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 26, marginTop: 8 }}>${selected.price}</div>
              </div>
            </div>
            {selected.description && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 13.5, color: "#B9B8C0", lineHeight: 1.5 }}>
                {selected.description}
              </div>
            )}
            <button
              onClick={() => { setCheckoutItem(selected); setSelected(null); setView("checkout"); }}
              style={{ marginTop: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFB000", color: "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 16, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" }}
            >
              <ShoppingBag size={17} /> Buy for ${selected.price}
            </button>
          </div>
        </div>
      )}

      {/* Sell drawer */}
      {sellOpen && (
        <div onClick={() => setSellOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,0.6)", display: "flex", justifyContent: "flex-end", zIndex: 40 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#17171D", borderLeft: "1px solid rgba(255,255,255,0.08)", width: 340, maxWidth: "90vw", height: "100%", padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 20 }}>List a card</div>
              <button type="button" onClick={() => setSellOpen(false)} style={{ background: "none", border: "none", color: "#8B8B95", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <Field label="Photo">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              {form.photo ? (
                <div style={{ position: "relative" }}>
                  <img src={form.photo} alt="Card preview" style={{ width: "100%", aspectRatio: "5 / 7", objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{ marginTop: 8, width: "100%", background: "#242430", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F3EE", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer" }}
                  >
                    Retake photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{ width: "100%", aspectRatio: "5 / 7", maxHeight: 140, background: "#1B1B22", border: "1.5px dashed rgba(255,255,255,0.18)", color: "#8B8B95", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 13 }}
                >
                  <Camera size={20} />
                  Take or upload a photo
                </button>
              )}
              <span style={{ fontSize: 11.5, color: "#6E6D78" }}>Buyers see exactly the card you're selling — no stock images.</span>
            </Field>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: 15, color: "#B9B8C0", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, marginTop: 2 }}>
              Card information
            </div>
            <Field label="Card name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Charizard" style={inputStyle} />
            </Field>
            <Field label="Set">
              <input value={form.set} onChange={(e) => setForm({ ...form, set: e.target.value })} placeholder="e.g. Base Set" style={inputStyle} />
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                {Object.keys(TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Rarity">
              <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} style={inputStyle}>
                {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Variant">
              <select value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} style={inputStyle}>
                {VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Condition">
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Grading">
              <select value={form.grading} onChange={(e) => setForm({ ...form, grading: e.target.value })} style={inputStyle}>
                {GRADING.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            {form.grading === "Graded" && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Company">
                    <select value={form.gradingCompany} onChange={(e) => setForm({ ...form, gradingCompany: e.target.value })} style={inputStyle}>
                      {GRADING_COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Grade">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      placeholder="e.g. 9.5"
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            )}
            <Field label="Price (USD)">
              <input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Additional information">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Anything buyers should know: edge wear, centering, when you got it, etc."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "Libre Franklin, sans-serif" }}
              />
            </Field>

            <button
              type="button"
              onClick={submitListing}
              disabled={Boolean(missingReason)}
              style={{ marginTop: 8, background: missingReason ? "#3A3A44" : "#FFB000", color: missingReason ? "#77767F" : "#1A1200", fontWeight: 600, fontFamily: "Rajdhani, sans-serif", fontSize: 16, border: "none", borderRadius: 10, padding: "12px", cursor: missingReason ? "not-allowed" : "pointer" }}
            >
              {missingReason || "Publish listing"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1B1B22", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "10px 18px", fontSize: 14, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#1B1B22",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 14,
  color: "#F5F3EE",
  outline: "none",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12.5, color: "#8B8B95" }}>{label}</span>
      {children}
    </label>
  );
}
