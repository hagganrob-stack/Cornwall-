import Byline from './Byline';
import { Container, Crumbs } from './Blocks';

export default function InfoPage({ title, lastChecked, children }) {
  return (
    <Container className="pt-8">
      <Crumbs items={[['Home', '/'], [title]]} />
      <h1 className="mt-4 text-4xl sm:text-5xl">{title}</h1>
      <Byline lastChecked={lastChecked} sourcesHref={null} className="mt-4" />
      <div className="prose-copy mt-8">{children}</div>
    </Container>
  );
}
