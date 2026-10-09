export default function SectionImage({ src, alt, title }) {
  return (
    <figure className="section-image">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <figcaption>{title}</figcaption>
    </figure>
  );
}