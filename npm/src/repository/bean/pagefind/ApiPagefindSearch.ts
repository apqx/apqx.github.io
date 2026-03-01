export interface ApiPagefindSearch {
    total: number,
    results: PagefindResultItem[]
}

export interface PagefindResult {
    results: [
        {
            id: string,
            data: () => Promise<PagefindResultItem>
        }
    ]
}

export interface PagefindResultItem {
    meta: {
        title: string,
        date: string,
        image: string,
        // 封面尺寸，格式为 6000x4000
        imageSize: string,
        author: string,
        actors: string,
        mentions: string,
        pinned: string,
        featured: string
    },
    url: string,
    raw_url: string,
    excerpt: string,
    content: string
}

// content: "为什么「国粹」是京剧而不是昆曲. 日双鱼月天蝎 2018年03月05日 昆曲与其它地方戏在表演风格和艺术成就方面几有云泥之别，我能看到，越来越多受过高等教育的年轻人对传统东方美学的追求日渐深入，被称为“中国雅乐”的昆曲正在江南迅速复苏。与此同时，昆曲与京剧孰为“国粹”的争论也越来…"

// excerpt: "是京剧而不是<mark>昆曲</mark>. 日双鱼月天蝎 2018年03月05日 <mark>昆曲</mark>与其它地方戏在表演风格和艺术成就方面几有云泥之别"

// filters: {}

// locations: [8, 20, 61, 69, 112, 152, 161, 198, 208, 226, …] (165)

// meta: Object

    // date: "2018年03月05日"

    // image: "https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me.jpg"

    // title: "为什么「国粹」是京剧而不是昆曲"

// raw_content: "为什么「国粹」是京剧而不是昆曲. 日双鱼月天蝎 2018年03月05日 昆曲与其它地方戏在表演风格和艺术成就方面几有云泥之别，我能看到，越来越多受过高等教育的年轻人对传统东方美学的…"

// raw_url: "/post/repost/2018/03/05/为什么-国粹-是京剧而不是昆曲.html"

// sub_results: Array (1)
// 0 Object

    // excerpt: "是京剧而不是<mark>昆曲</mark>. 日双鱼月天蝎 2018年03月05日 <mark>昆曲</mark>与其它地方戏在表演风格和艺术成就方面几有云泥之别"

    // locations: [8, 20, 61, 69, 112, 152, 161, 198, 208, 226, …] (165)

    // title: "为什么「国粹」是京剧而不是昆曲"

    // url: "/npm/dist/post/repost/2018/03/05/为什么-国粹-是京剧而不是昆曲.html"

    // weighted_locations: [{weight: 7, balanced_score: 25095.023, location: 8}, {weight: 1, balanced_score: 512.1433, location: 20}, {weight: 1, balanced_score: 512.1433, location: 61}, {weight: 1, balanced_score: 512.1433, location: 69}, {weight: 1, balanced_score: 512.1433, location: 112}, {weight: 1, balanced_score: 512.1433, location: 152}, {weight: 1, balanced_score: 512.1433, location: 161}, {weight: 1, balanced_score: 512.1433, location: 198}, {weight: 1, balanced_score: 512.1433, location: 208}, {weight: 1, balanced_score: 512.1433, location: 226}, …] (165)

    // url: "/npm/dist/post/repost/2018/03/05/为什么-国粹-是京剧而不是昆曲.html"

// weighted_locations: [{weight: 7, balanced_score: 25095.023, location: 8}, {weight: 1, balanced_score: 512.1433, location: 20}, {weight: 1, balanced_score: 512.1433, location: 61}, {weight: 1, balanced_score: 512.1433, location: 69}, {weight: 1, balanced_score: 512.1433, location: 112}, {weight: 1, balanced_score: 512.1433, location: 152}, {weight: 1, balanced_score: 512.1433, location: 161}, {weight: 1, balanced_score: 512.1433, location: 198}, {weight: 1, balanced_score: 512.1433, location: 208}, {weight: 1, balanced_score: 512.1433, location: 226}, …] (165)

// word_count: 6282