import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export const Footer = () => (
  <footer className="w-full mt-16 pb-8 flex items-center justify-center gap-4">
    <span className="font-display text-xs text-neutral-600">
      Mariana Castro
    </span>
    <span className="text-neutral-700 text-xs">·</span>
    <div className="flex items-center gap-3">
      <a href="https://github.com/maricastroc" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-400 transition-colors" title="GitHub">
        <FontAwesomeIcon icon={faGithub} size="sm" />
      </a>
      <a href="https://www.linkedin.com/in/marianacastrorc/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-400 transition-colors" title="LinkedIn">
        <FontAwesomeIcon icon={faLinkedin} size="sm" />
      </a>
      <a href="mailto:marianacastrorc@gmail.com" className="text-neutral-600 hover:text-neutral-400 transition-colors" title="Email">
        <FontAwesomeIcon icon={faEnvelope} size="sm" />
      </a>
    </div>
  </footer>
);
