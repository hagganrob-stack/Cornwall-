import Byline from './Byline';
import { Container, Crumbs } from './Blocks';

export default function InfoPage({ title, lastChecked, children }) {
  return (
    <Container className="pt-8 sm:pt-12">
      <Crumbs items={[['Home', '/'], [title]]} />
      <h1 className="mt-8 max-w-5xl text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">{title}</h1>
      <Byline lastChecked={lastChecked} sourcesHref={null} className="mt-6" />
      <div className="prose-copy mt-8">{children}</div>
    </Container>
  );
}
