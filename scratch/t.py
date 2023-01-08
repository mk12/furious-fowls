import json

TYPES = {
    0: "wood",
    1: "steel",
    2: "lead",
}

def convert(tsv_filename, json_filename):
    with open(tsv_filename, 'r') as tsv_file, open(json_filename, 'w') as json_file:
        it = iter(tsv_file)
        get = lambda: [int(x) for x in next(it).strip().split('\t')]
        birds, blocks, pigs, start_x, _ = get()
        res = {"start": start_x, "birds": birds, "pigs": [], "blocks": []}
        for _ in range(blocks):
            w, h, x, y, t = get()
            res["blocks"].append({
                "type": TYPES[t],
                "x": x,
                "y": y,
                "w": w,
                "h": h,
            })
        for _ in range(pigs):
            x, y = get()
            res["pigs"].append({"x": x, "y": y})
        json.dump(res, json_file)

for i in range(1, 9):
    convert(f"src/levels/level{i}.tsv", f"src/levels/standard_{i}.json")
for i in range(1, 4):
    convert(f"src/levels/customlevel{i}.tsv", f"src/levels/custom_{i}.json")
