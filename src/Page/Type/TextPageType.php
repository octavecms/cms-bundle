<?php

namespace Octave\CMSBundle\Page\Type;

use Octave\CMSBundle\Entity\Content;
use Octave\CMSBundle\Entity\ContentTranslation;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class TextPageType extends BasePageType
{
    const TYPE = 'text_page';

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
        return 'OctaveCMSBundle:TextPage:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_TEXT_PAGE_CREATE';
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

        $output['name'] = $page->getName();
        $output['path'] = $page->getPath();
        $output['active'] = $page->isActive();
        $output['include_in_menu'] = $page->isIncludeInMenu();
        $output['include_in_sitemap'] = $page->isIncludeInSitemap();

        if ($content) {
            $output['template'] = $content->getTemplate();

            /**
             * @var string $locale
             * @var ContentTranslation $translation
             */
            foreach ($content->getTranslations() as $locale => $translation) {
                $output['translations'][$locale] = $translation->getText();
            }
        }

        $seo = $page->getTranslations();

        foreach ($seo as $locale => $translation) {
            $output['seo'][$locale] = [
                'title' => $translation->getTitle(),
                'metaTitle' => $translation->getMetaTitle(),
                'metaKeywords' => $translation->getMetaKeywords(),
                'metaDescription' => $translation->getMetaDescription(),
            ];
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

        if (isset($data['seo'])) {
            foreach ($data['seo'] as $locale => $seoData) {
                $translation = $page->translate($locale, false);

                $translation->setTitle($seoData['title']);
                $translation->setMetaTitle($seoData['metaTitle']);
                $translation->setMetaKeywords($seoData['metaKeywords']);
                $translation->setMetaDescription($seoData['metaDescription']);

                $page->addTranslation($translation);
            }
        }

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