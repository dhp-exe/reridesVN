def rank_options(options):
    cheapest = min(options, key=lambda x: x.price_vnd)
    return cheapest.provider
