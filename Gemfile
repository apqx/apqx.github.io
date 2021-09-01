source "https://mirrors.aliyun.com/rubygems/"

gem "jekyll"
# 必要时用rbenv指定工程使用的ruby版本，与系统级版本分离
# ruby '3.0.0', :patchlevel => '0'

group :jekyll_plugins do
  # ruby 3.0之后标准库不再包含webrick，要手动依赖
  gem "webrick"
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "kramdown", ">= 2.3.1"
  gem 'jekyll-redirect-from'
end