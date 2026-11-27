import { publishedHelp } from '../../../src/help/queries';
import { requireProfile } from '../../../src/panel/queries';
import { HelpCenter } from './help-center';

export default async function HelpPage() {
  await requireProfile();
  const help = await publishedHelp();
  return <HelpCenter categories={help.categories} contact={help.contact} />;
}
