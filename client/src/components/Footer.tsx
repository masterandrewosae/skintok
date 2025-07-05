export default function Footer() {
  return (
    <footer className="bg-neutral border-t border-gray-600 mt-16 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-video text-white"></i>
          </div>
          <span className="text-xl font-bold">ClipGenius</span>
        </div>
        <p className="text-gray-400 mb-4">Transform your videos with AI-powered editing</p>
        <div className="flex justify-center space-x-6 text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
