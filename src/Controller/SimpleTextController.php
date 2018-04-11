<?php

namespace Octave\CMSBundle\Controller;

use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Form\Type\SimpleTextType;
use Octave\CMSBundle\Page\Type\SimpleTextPageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class SimpleTextController extends Controller
{
    /**
     * @param Request $request
     * @param Page|null $page
     * @param null $version
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, Page $page = null, $version = null)
    {
        $isNew = !$page;
        $pageRepository = $this->get('octave.cms.page.repository');
        $isAdmin = ($this->getParameter('octave.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('octave.cms.super_admin_role'))
            : true;
        $templates = $this->get('octave.cms.page.manager')->getSimpleTextTemplatesAsChoices();
        $isPublish = $request->get('publish');

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(SimpleTextPageType::TYPE);
        }

        $form = $this->createForm(SimpleTextType::class, $page, [
            'method' => 'post',
            'is_admin' => $isAdmin,
            'locales' => $this->getParameter('locales'),
            'templates' => $templates
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            $emptyName = false;
            if (!$page->getName()) {
                $emptyName = true;
                $page->setName(sprintf('simple_text_%s', time()));
            }

            if (!$isPublish && $version) {
                $this->get('octave.cms.page.version.manager')->storeVersion($page, $version);
            }
            else {
                $content = $page->getContent();
                $content->setPage($page);

                /** @var EntityManager $em */
                $em = $this->getDoctrine()->getManager();
                $em->flush();
            }

            if ($emptyName) {
                $page->setName(sprintf('simple_text_%d', $page->getId()));
            }

            $page->setController($this->getParameter('octave.cms.simple_text_controller'));
            $page->setOption('id', $page->getId());

            if ($isPublish) {
                $em->flush();
            }

            if (!$isNew) {

                if ($request->get('update_and_list') || $isPublish) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_create_type', ['type' => SimpleTextPageType::TYPE]);
                }
            }
        }

        return $this->render('OctaveCMSBundle:SimpleText:create_simple_txt.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'isAdmin' => $isAdmin,
            'version' => $version
        ]);
    }

    /**
     * @param Page $page
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showAction(Page $page)
    {
        $template = $page->getContent()->getTemplate()
            ? $page->getContent()->getTemplate()
            : $this->getParameter('octave.cms.simple_text_template');

        return $this->render($template, [
            'page' => $page
        ]);
    }
}