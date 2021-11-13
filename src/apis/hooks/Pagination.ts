interface Page {
  size: number;
  page: number;
}

export const useFindCount = async (model: any, where: any, page: Page) => {
  return await model().findAndCount({ where, skip: page.size * (page.page - 1), take: page.size, order: { id: "DESC" } });
};
