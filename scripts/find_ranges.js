const fs = require("fs");
const lines = fs.readFileSync("src/App.jsx", "utf8").split("\n");

const markers = [
  { name: "SEOMeta", start: "const SEOMeta = () => {" },
  { name: "BIZ", start: "const BIZ = {" },
  { name: "VMW", start: "const VMW = {" },
  { name: "SUPABASE", start: "const SUPABASE_CONFIG = {" },
  { name: "THEMES", start: "const THEMES = {" },
  { name: "buildCSS", start: "const buildCSS = (C) => `" },
  { name: "GALLERY_IDOLS", start: "const GALLERY_IDOLS = [" },
  { name: "IMG", start: "const IMG = {" },
  { name: "Dot", start: "const Dot = () => {" },
  { name: "ANIMATIONS", start: "const Reveal = ({ children" },
  { name: "StarBorderButton", start: "const StarBorderButton = (" },
  { name: "CurvyButton", start: "const CurvyButton = (" },
  { name: "SectionCTA", start: "const SectionCTA = (" },
  { name: "CanvasBg", start: "const CanvasBg = () => {" },
  { name: "Grain", start: "const Grain = () => (" },
  { name: "Loader", start: "const Loader = ({ onDone" },
  { name: "Nav", start: "const Nav = ({ scrolled" },
  { name: "Hero", start: "const Hero = () => {" },
  { name: "Legacy", start: "const Legacy = () => {" },
  { name: "TrustedByTemples", start: "const TrustedByTemples = () => {" },
  { name: "Services", start: "const Services = () => {" },
  { name: "Showcase", start: "const Showcase = () => {" },
  { name: "RealWorkPhotos", start: "const RealWorkPhotos = () => {" },
  { name: "ProcessSection", start: "const ProcessSection = () => {" },
  { name: "PremiumFilterTabs", start: "const PremiumFilterTabs = (" },
  { name: "Gallery", start: "const Gallery = ({" },
  { name: "Testimonials", start: "const Testimonials = () => {" },
  { name: "FAQ", start: "const FAQ = () => {" },
  { name: "Archive", start: "const Archive = () => {" },
  { name: "Contact", start: "const Contact = () => {" },
  { name: "Footer", start: "const Footer = () => {" },
  { name: "WAFab", start: "const WAFab = () => {" },
  { name: "MobileContactBar", start: "const MobileContactBar = () => {" },
  { name: "ThemeToggle", start: "const ThemeToggle = (" },
  { name: "GalleryPreview", start: "const GalleryPreview = (" },
  { name: "HomePage", start: "const HomePage = (" },
  { name: "ImmersiveFeed", start: "const ImmersiveFeed = () => {" },
  { name: "GalleryPage", start: "const GalleryPage = (" },
  { name: "ProfileModal", start: "const ProfileModal = (" },
  { name: "CommissionModal", start: "const CommissionModal = (" },
  { name: "AuthModal", start: "const AuthModal = (" },
  { name: "AdminLogin", start: "const AdminLogin = () => {" },
  { name: "AdminGalleryManager", start: "const AdminGalleryManager = (" },
  { name: "AdminDashboard", start: "const AdminDashboard = () => {" },
  { name: "AppContent", start: "function AppContent() {" },
  { name: "ErrorBoundary", start: "class ErrorBoundary extends React.Component {" },
  { name: "App", start: "export default function App() {" }
];

markers.forEach(m => {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(m.start)) {
      m.line = i + 1;
      break;
    }
  }
});

console.log(JSON.stringify(markers, null, 2));
