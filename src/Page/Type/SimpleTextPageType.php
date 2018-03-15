<?php

namespace VideInfra\CMSBundle\Page\Type;

use VideInfra\CMSBundle\Entity\Content;
use VideInfra\CMSBundle\Entity\ContentTranslation;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SimpleTextPageType extends BasePageType
{
    const TYPE = 'simple_text';

    /**
     * @return string
     */
    public function getName()
    {
        return self::TYPE;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return 'VideInfraCMSBundle:SimpleText:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_SIMPLE_TEXT_PAGE_CREATE';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa-file-archive-o';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Text';
    }

    /**
     * @param Page $page
     * @return array
     */
    public function serialize(Page $page)
    {
        $output = [];

        $content = $page->getContent();
        if (!$content) return $output;

        $output['name'] = $page->getName();
        $output['path'] = $page->getPath();
        $output['active'] = $page->isActive();
        $output['include_in_menu'] = $page->isIncludeInMenu();
        $output['include_in_sitemap'] = $page->isIncludeInSitemap();

        $output['template'] = $content->getTemplate();

        /**
         * @var string $locale
         * @var ContentTranslation $translation
         */
        foreach ($content->getTranslations() as $locale => $translation) {
            $output['translations'][$locale] = $translation->getText();
        }

        return $output;
    }

    /**
     * @param PageVersion $version
     * @return Page
     */
    public function unserialize(PageVersion $version)
    {
        $page = $version->getPage();
        $data = json_decode($version->getContent(), true);

        $page->setName($data['name'] ?? null);
        $page->setPath($data['path'] ?? null);
        $page->setActive($data['active'] ?? null);
        $page->setIncludeInMenu($data['include_in_menu'] ?? null);
        $page->setIncludeInSitemap($data['include_in_sitemap'] ?? null);

        $content = $page->getContent();
        if (!$content) {
            $content = new Content();
            $content->setPage($page);
            $page->setContent($content);
        }
        $content->setTemplate($data['template'] ?? null);

        $translations = [];
        foreach ($content->getTranslations() as $locale => $translation) {
            $translations[$locale] = $translation;
        }

        if (isset($data['translations'])) {
            foreach ($data['translations'] as $locale => $text) {

                $translation = $translations[$locale] ?? null;

                if (!$translation) {
                    $translation = new ContentTranslation();
                    $translation->setTranslatable($content);
                    $translation->setLocale($locale);
                    $content->addTranslation($translation);
                }

                $translation->setText($text);
            }
        }

        return $page;
    }
}