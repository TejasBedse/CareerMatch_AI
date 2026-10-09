export default function SectionImage({ src, alt, title, variant = 'feature' }) {
  return (
    <figure className={`section-image section-image--${variant}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <figcaption>{title}</figcaption>
    </figure>
  );
}