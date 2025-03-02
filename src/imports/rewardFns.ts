export const addNewReward = async (newreward: any) => {
    const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newreward, price: newreward.cost, admin: true }),

    });
    if (!res.ok) {
        throw new Error(`Failed to add reward: ${res.statusText}`);
    }
    return await res.json();
};


export const fetchAllRewards = async () => {
    const res = await fetch("/api/rewards", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch rewards: ${res.statusText}`);
    }

    return await res.json();
};


export const deleteReward = async(name:string) =>{
    const res = await fetch("/api/rewards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error("Failed to remove event creator");
      }
};