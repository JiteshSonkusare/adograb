export const Formatter = {
  success(message: string): void {
    console.log(`\n✔  ${message}`);
  },

  error(message: string): void {
    console.error(`\n✖  ${message}`);
  },

  info(message: string): void {
    console.log(`   ${message}`);
  },

  warn(message: string): void {
    console.warn(`\n⚠  ${message}`);
  },

  section(title: string): void {
    console.log(`\n${title}`);
    console.log('─'.repeat(title.length));
  },

  config(data: Record<string, unknown>): void {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      console.log('   (no configuration saved)');
      return;
    }
    const maxKey = Math.max(...entries.map(([k]) => k.length));
    for (const [key, value] of entries) {
      console.log(`   ${key.padEnd(maxKey)}  ${value}`);
    }
  },

  repoList(repos: string[]): void {
    repos.forEach((name, i) => {
      console.log(`   ${String(i + 1).padStart(3)}.  ${name}`);
    });
  },
};
