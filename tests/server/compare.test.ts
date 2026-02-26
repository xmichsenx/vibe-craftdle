import { compareClassicEntities } from "../../server/src/utils/compare";
import { ClassicEntity } from "../../server/src/types";

function makeEntity(overrides: Partial<ClassicEntity> = {}): ClassicEntity {
  return {
    id: "test_item",
    name: "Test Item",
    type: "Block",
    dimension: ["Overworld"],
    behavior: "N/A",
    stackable: true,
    renewable: true,
    versionAdded: "1.0",
    textureUrl: "/textures/test.png",
    wikiUrl: "https://minecraft.wiki/w/Test",
    ...overrides,
  };
}

describe("compareClassicEntities", () => {
  it("returns all matches for identical entities", () => {
    const entity = makeEntity();
    const result = compareClassicEntities(entity, entity);

    expect(result.name).toBe("Test Item");
    expect(result.type.match).toBe(true);
    expect(result.dimension.match).toBe(true);
    expect(result.behavior.match).toBe(true);
    expect(result.stackable.match).toBe(true);
    expect(result.renewable.match).toBe(true);
    expect(result.versionAdded.match).toBe(true);
  });

  it("returns no matches for completely different entities", () => {
    const guess = makeEntity({
      type: "Block",
      dimension: ["Overworld"],
      behavior: "N/A",
      stackable: true,
      renewable: true,
      versionAdded: "1.0",
    });
    const target = makeEntity({
      type: "Mob",
      dimension: ["Nether"],
      behavior: "Hostile",
      stackable: false,
      renewable: false,
      versionAdded: "1.19",
    });

    const result = compareClassicEntities(guess, target);

    expect(result.type.match).toBe(false);
    expect(result.dimension.match).toBe(false);
    expect(result.behavior.match).toBe(false);
    expect(result.stackable.match).toBe(false);
    expect(result.renewable.match).toBe(false);
    expect(result.versionAdded.match).toBe(false);
  });

  it("correctly compares array dimensions with same elements in different order", () => {
    const guess = makeEntity({ dimension: ["Nether", "Overworld"] });
    const target = makeEntity({ dimension: ["Overworld", "Nether"] });
    const result = compareClassicEntities(guess, target);
    // Both contain same elements — should match
    expect(result.dimension.match).toBe(true);
  });

  it("correctly compares array dimensions with different lengths", () => {
    const guess = makeEntity({ dimension: ["Overworld"] });
    const target = makeEntity({ dimension: ["Overworld", "Nether"] });
    const result = compareClassicEntities(guess, target);
    expect(result.dimension.match).toBe(false);
  });

  it("returns correct values in feedback", () => {
    const guess = makeEntity({ type: "Weapon", stackable: false });
    const target = makeEntity({ type: "Block", stackable: true });
    const result = compareClassicEntities(guess, target);

    expect(result.type.value).toBe("Weapon");
    expect(result.stackable.value).toBe(false);
  });

  it("includes name and textureUrl from guess", () => {
    const guess = makeEntity({
      name: "Diamond Sword",
      textureUrl: "/textures/diamond_sword.png",
    });
    const target = makeEntity({ name: "Creeper" });
    const result = compareClassicEntities(guess, target);

    expect(result.name).toBe("Diamond Sword");
    expect(result.textureUrl).toBe("/textures/diamond_sword.png");
  });
});
