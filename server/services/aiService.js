function getProviderStatus() {
  const provider = process.env.AI_PROVIDER || 'deterministic';
  const configured = Boolean(process.env.AI_API_KEY);
  return {
    provider: configured ? provider : 'deterministic',
    configured,
    fallback: 'deterministic rule-based analysis',
    message: configured
      ? `${provider} is configured for optional assisted analysis.`
      : 'No external AI provider is configured; deterministic analysis remains active.',
  };
}

module.exports = { getProviderStatus };
