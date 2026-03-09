### Next updates:

1. Silhouette Mode
   Show a blacked-out silhouette of a mob's render image. The player guesses which mob it is. On each wrong guess, gradually reduce the blackout opacity (e.g., 100% → 80% → 60% → reveal colors). Uses the mob textureUrl renders already fetched. Unique because it tests visual shape recognition rather than color/detail like Texture mode.

2. Timeline / "Higher or Lower" Mode
   The player is shown an item/mob and must guess whether the next item was added in a higher or lower version number. A streak-based mode — how many can you get right in a row? Uses the versionAdded field which is on every entity but currently only shown as Classic feedback. Simple, addictive, and very different from the existing modes.

3. Reverse Crafting Mode
   The player is shown the output item and must place/guess the ingredients in the correct grid positions. The inverse of Crafting Grid mode. On wrong placement, one correctly-placed ingredient locks in (progressive assist). Uses existing recipe data + ingredient icons.
